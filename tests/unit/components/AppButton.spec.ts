import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { render, fireEvent } from '@testing-library/vue';
import AppButton from '@/components/common/AppButton.vue';

describe('AppButton.vue', () => {
  it('renders with default props', () => {
    const wrapper = mount(AppButton, {
      slots: {
        default: 'Test Button'
      }
    });

    expect(wrapper.text()).toBe('Test Button');
    expect(wrapper.classes()).toContain('app-button');
    expect(wrapper.classes()).toContain('app-button--primary');
    expect(wrapper.classes()).not.toContain('app-button--block');
    expect(wrapper.attributes('disabled')).toBeUndefined();
  });

  it('renders with custom variant', () => {
    const wrapper = mount(AppButton, {
      props: {
        variant: 'secondary'
      },
      slots: {
        default: 'Secondary Button'
      }
    });

    expect(wrapper.classes()).toContain('app-button--secondary');
  });

  it('renders as block button', () => {
    const wrapper = mount(AppButton, {
      props: {
        block: true
      }
    });

    expect(wrapper.classes()).toContain('app-button--block');
  });

  it('renders as disabled button', () => {
    const wrapper = mount(AppButton, {
      props: {
        disabled: true
      }
    });

    expect(wrapper.attributes('disabled')).toBeDefined();
  });

  it('emits click event when clicked', async () => {
    const { getByRole, emitted } = render(AppButton, {
      slots: {
        default: 'Click Me'
      }
    });

    const button = getByRole('button');
    await fireEvent.click(button);

    expect(emitted()).toHaveProperty('click');
  });

  it('does not emit click event when disabled', async () => {
    const wrapper = mount(AppButton, {
      props: {
        disabled: true
      },
      slots: {
        default: 'Disabled Button'
      }
    });

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });
});
