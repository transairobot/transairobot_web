import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppCard from '@/components/common/AppCard.vue';

describe('AppCard.vue', () => {
  it('renders with default props', () => {
    const wrapper = mount(AppCard, {
      slots: {
        default: '<div>Card Content</div>'
      }
    });

    expect(wrapper.html()).toContain('Card Content');
    expect(wrapper.classes()).toContain('app-card');
    expect(wrapper.classes()).toContain('app-card--default');
    expect(wrapper.classes()).not.toContain('app-card--hoverable');
  });

  it('renders with primary variant', () => {
    const wrapper = mount(AppCard, {
      props: {
        variant: 'primary'
      }
    });

    expect(wrapper.classes()).toContain('app-card--primary');
  });

  it('renders with secondary variant', () => {
    const wrapper = mount(AppCard, {
      props: {
        variant: 'secondary'
      }
    });

    expect(wrapper.classes()).toContain('app-card--secondary');
  });

  it('renders with outline variant', () => {
    const wrapper = mount(AppCard, {
      props: {
        variant: 'outline'
      }
    });

    expect(wrapper.classes()).toContain('app-card--outline');
  });

  it('renders as hoverable card', () => {
    const wrapper = mount(AppCard, {
      props: {
        hoverable: true
      }
    });

    expect(wrapper.classes()).toContain('app-card--hoverable');
  });

  it('contains shine element for hover effect', () => {
    const wrapper = mount(AppCard);

    expect(wrapper.find('.app-card__shine').exists()).toBe(true);
  });

  it('renders nested content correctly', () => {
    const wrapper = mount(AppCard, {
      slots: {
        default: `
          <h2>Card Title</h2>
          <p>Card description text</p>
        `
      }
    });

    expect(wrapper.html()).toContain('<h2>Card Title</h2>');
    expect(wrapper.html()).toContain('<p>Card description text</p>');
  });
});
