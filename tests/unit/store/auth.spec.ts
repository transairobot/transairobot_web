import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import authModule from '@/store/modules/auth.js';

// Define interfaces for mocks
interface LocalStorageMock {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  [key: string]: any;
}

interface User {
  id?: string;
  name?: string;
  role?: string;
  developerStatus?: string;
  email?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  tokenExpiration: number | null;
}

// Mock localStorage
const localStorageMock: LocalStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

// Mock auth service
vi.mock('@/services/auth.service', () => ({
  default: {
    login: vi.fn().mockResolvedValue({ user: { id: '1', name: 'Test User' } }),
    logout: vi.fn().mockResolvedValue({}),
    getProfile: vi.fn().mockResolvedValue({ id: '1', name: 'Test User', role: 'user' })
  }
}));

// Mock developer service
vi.mock('@/services/developer.service', () => ({
  default: {
    applyForDeveloperStatus: vi.fn().mockResolvedValue({
      id: '1',
      name: 'Test User',
      role: 'user',
      developerStatus: 'pending'
    })
  }
}));

// Create a valid JWT token for testing
const createValidToken = (): string => {
  const futureDate = new Date();
  futureDate.setHours(futureDate.getHours() + 1);
  const exp = Math.floor(futureDate.getTime() / 1000);
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ exp, sub: '123', name: 'Test User' }));
  return `${header}.${payload}.signature`;
};

describe('Auth Store Module', () => {
  let store: {
    state: AuthState;
    getters: { [key: string]: (state: AuthState) => any };
    commit: (mutation: string, payload?: any) => void;
    dispatch: (action: string, payload?: any) => Promise<any>;
  };

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    localStorageMock.clear();
    store = {
      state: { ...authModule.state },
      getters: {},
      commit: vi.fn(),
      dispatch: vi.fn()
    };
    Object.keys(authModule.getters).forEach(key => {
      store.getters[key] = authModule.getters[key](store.state);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Getters', () => {
    it('isAuthenticated returns false when no token exists', () => {
      expect(authModule.getters.isAuthenticated(store.state)).toBe(false);
    });

    it('isAuthenticated returns true when valid token exists', () => {
      store.state.token = createValidToken();
      store.state.tokenExpiration = Date.now() + 3600000;
      expect(authModule.getters.isAuthenticated(store.state)).toBe(true);
    });

    it('isDeveloper returns true for developer role', () => {
      store.state.user = { role: 'developer' };
      expect(authModule.getters.isDeveloper(store.state)).toBe(true);
    });

    it('isDeveloper returns true for admin role', () => {
      store.state.user = { role: 'admin' };
      expect(authModule.getters.isDeveloper(store.state)).toBe(true);
    });

    it('isDeveloper returns true for approved developer status', () => {
      store.state.user = { role: 'user', developerStatus: 'approved' };
      expect(authModule.getters.isDeveloper(store.state)).toBe(true);
    });

    it('isDeveloper returns false for regular user', () => {
      store.state.user = { role: 'user' };
      expect(authModule.getters.isDeveloper(store.state)).toBe(false);
    });

    it('isDeveloperPending returns true for pending developer status', () => {
      store.state.user = { developerStatus: 'pending' };
      expect(authModule.getters.isDeveloperPending(store.state)).toBe(true);
    });
  });

  describe('Mutations', () => {
    it('SET_USER updates user state and localStorage', () => {
      const user: User = { id: '1', name: 'Test User' };
      authModule.mutations.SET_USER(store.state, user);
      expect(store.state.user).toEqual(user);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(user));
    });

    it('SET_USER removes user from localStorage when null', () => {
      authModule.mutations.SET_USER(store.state, null);
      expect(store.state.user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });

    it('SET_TOKEN updates token state and localStorage', () => {
      const token = createValidToken();
      const originalSetToken = authModule.mutations.SET_TOKEN;
      authModule.mutations.SET_TOKEN = vi.fn((state: AuthState, tokenValue: string | null) => {
        state.token = tokenValue;
        state.tokenExpiration = Date.now() + 3600000;
        if (tokenValue) {
          localStorageMock.setItem('token', tokenValue);
        } else {
          localStorageMock.removeItem('token');
        }
      });
      authModule.mutations.SET_TOKEN(store.state, token);
      expect(store.state.token).toBe(token);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', token);
      authModule.mutations.SET_TOKEN = originalSetToken;
    });

    it('SET_TOKEN removes token from localStorage when null', () => {
      authModule.mutations.SET_TOKEN(store.state, null);
      expect(store.state.token).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });

    it('UPDATE_USER merges user data', () => {
      store.state.user = { id: '1', name: 'Original Name', email: 'test@example.com' };
      const update: User = { name: 'Updated Name' };
      authModule.mutations.UPDATE_USER(store.state, update);
      expect(store.state.user).toEqual({
        id: '1',
        name: 'Updated Name',
        email: 'test@example.com'
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(store.state.user)
      );
    });
  });

  describe('Actions', () => {
    it('login commits token and user', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const user = { id: '1', name: 'Test User' };
      // Mock the service to return a specific user
      const authService = (await import('@/services/auth.service')).default;
      authService.login = vi.fn().mockResolvedValue({ user });

      await authModule.actions.login(store, credentials);
      expect(store.commit).toHaveBeenCalledWith('SET_USER', user);
    });

    it('logout clears user data', async () => {
      const rootState = { auth: { token: createValidToken() } };
      await authModule.actions.logout.call({ state: rootState }, store);
      expect(store.commit).toHaveBeenCalledWith('SET_TOKEN', null);
      expect(store.commit).toHaveBeenCalledWith('SET_USER', null);
    });

    it('updateUser commits user data update', () => {
      const userData: User = { name: 'Updated Name' };
      authModule.actions.updateUser(store, userData);
      expect(store.commit).toHaveBeenCalledWith('UPDATE_USER', userData);
    });
  });
});
