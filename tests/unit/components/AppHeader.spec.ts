import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import AppHeader from '@/components/common/AppHeader.vue';

// Mock the store
vi.mock('vuex', () => ({
  useStore: () => ({
    getters: {
      'auth/isAuthenticated': false,
      'auth/currentUser': null,
      'auth/userRole': null
    }
  })
}));

// Improved vue-router mock
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    currentRoute: {
      value: {
        path: '/',
        query: {}
      }
    }
  }),
  useRoute: () => ({
    path: '/',
    query: {}
  })
}));

// Mock child components
vi.mock('@/components/common/ThemeToggle.vue', () => ({
  default: {
    name: 'ThemeToggle',
    template: '<div class="theme-toggle-mock"></div>'
  }
}));

describe('AppHeader.vue', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    // Mock window scroll event
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });

    // Create wrapper
    wrapper = mount(AppHeader, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
            props: ['to']
          }
        },
        mocks: {
          $route: { path: '/' }
        }
      }
    });
  });

  it('renders the logo and company name', () => {
    expect(wrapper.find('.logo-text').exists()).toBe(true);
    // Adjust the expectation if the actual text is different
    expect(wrapper.find('.logo-text').text()).toBe('TransAIRobot');
  });

  it('renders the company tagline', () => {
    expect(wrapper.find('.logo-tagline').exists()).toBe(true);
    // Adjust the expectation if the actual text is different
    expect(wrapper.find('.logo-tagline').text()).toBe('develop once, run anywhere');
  });

  it('renders navigation links', () => {
    const navLinks = wrapper.findAll('.main-nav ul li a');

    expect(navLinks.length).toBeGreaterThan(0);
    // Adjust these expectations if the actual text is different
    expect(navLinks[0].text()).toBe('Home');
    expect(navLinks[1].text()).toBe('App Store');
    expect(navLinks[2].text()).toBe('My Robots');
    expect(navLinks[3].text()).toBe('Developer');
  });

  it('toggles mobile menu when button is clicked', async () => {
    // Set isMobileMenuOpen directly if it's reactive
    if (wrapper.vm.isMobileMenuOpen !== undefined) {
      wrapper.vm.isMobileMenuOpen = false;
      await wrapper.vm.$nextTick();
    }

    const menuButton = wrapper.find('.mobile-menu-toggle');
    expect(menuButton.exists()).toBe(true);

    // Click to open
    await menuButton.trigger('click');

    // Check if the menu is open
    // This might need adjustment based on how the component actually works
    expect(wrapper.find('.main-nav').classes()).toContain('main-nav--open');

    // Click to close
    await menuButton.trigger('click');

    // Check if the menu is closed
    expect(wrapper.find('.main-nav').classes()).not.toContain('main-nav--open');
  });

  it('adds scrolled class when page is scrolled', async () => {
    // Initially not scrolled
    expect(wrapper.find('.app-header').classes()).not.toContain('app-header--scrolled');

    // Simulate scroll
    window.scrollY = 100;
    await window.dispatchEvent(new Event('scroll'));
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.app-header').classes()).toContain('app-header--scrolled');

    // Simulate scroll back to top
    window.scrollY = 0;
    await window.dispatchEvent(new Event('scroll'));
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.app-header').classes()).not.toContain('app-header--scrolled');
  });

  it('includes theme toggle component', () => {
    expect(wrapper.find('.theme-toggle-mock').exists()).toBe(true);
  });

  it('closes mobile menu when a navigation link is clicked', async () => {
    // Set isMobileMenuOpen directly if it's reactive
    if (wrapper.vm.isMobileMenuOpen !== undefined) {
      wrapper.vm.isMobileMenuOpen = true;
      await wrapper.vm.$nextTick();
    }

    // Find a navigation link
    const navLink = wrapper.findAll('.main-nav ul li a')[0];
    expect(navLink.exists()).toBe(true);

    // Click the link
    await navLink.trigger('click');

    // Check if the menu is closed
    // This might need adjustment based on how the component actually works
    expect(wrapper.find('.main-nav').classes()).not.toContain('main-nav--open');
  });
});
