# Component Documentation

This document provides detailed information about the components available in the TransAIRobot website project.

## Core Components

### AppButton

A customizable button component with various styles and animations.

#### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'primary'` \| `'secondary'` \| `'outline'` \| `'text'` | `'primary'` | Button style variant |
| size | `'small'` \| `'medium'` \| `'large'` | `'medium'` | Button size |
| disabled | `boolean` | `false` | Whether the button is disabled |
| loading | `boolean` | `false` | Whether to show loading state |
| icon | `string` | `undefined` | Icon name to display |
| iconPosition | `'left'` \| `'right'` | `'left'` | Position of the icon |

#### Events

| Name | Parameters | Description |
|------|------------|-------------|
| click | `Event` | Emitted when the button is clicked |

#### Example

```vue
<AppButton 
  variant="primary" 
  size="medium" 
  :loading="isLoading" 
  @click="handleClick"
>
  Submit
</AppButton>
```

### AppCard

A card component for displaying content with hover effects.

#### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| title | `string` | `undefined` | Card title |
| subtitle | `string` | `undefined` | Card subtitle |
| image | `string` | `undefined` | URL of the image to display |
| elevation | `number` | `1` | Card elevation level (1-5) |
| clickable | `boolean` | `false` | Whether the card is clickable |

#### Slots

| Name | Description |
|------|-------------|
| default | Card content |
| header | Card header content (replaces title/subtitle) |
| footer | Card footer content |
| image | Custom image content |

#### Example

```vue
<AppCard 
  title="Robot Application" 
  subtitle="Version 1.0.0" 
  image="/path/to/image.jpg" 
  :clickable="true"
  @click="handleCardClick"
>
  <p>This is the card content.</p>
  <template #footer>
    <div class="card-actions">
      <AppButton size="small">Install</AppButton>
    </div>
  </template>
</AppCard>
```

### SearchBar

A search input component with autocomplete functionality.

#### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| placeholder | `string` | `'Search...'` | Placeholder text |
| value | `string` | `''` | Search input value |
| suggestions | `Array<string>` | `[]` | Autocomplete suggestions |
| loading | `boolean` | `false` | Whether to show loading state |
| debounce | `number` | `300` | Debounce time in milliseconds |

#### Events

| Name | Parameters | Description |
|------|------------|-------------|
| input | `string` | Emitted when the input value changes |
| search | `string` | Emitted when the search is submitted |
| select | `string` | Emitted when a suggestion is selected |

#### Example

```vue
<SearchBar
  placeholder="Search applications..."
  v-model="searchQuery"
  :suggestions="searchSuggestions"
  :loading="isSearching"
  @search="handleSearch"
  @select="handleSuggestionSelect"
/>
```

## Layout Components

### AppHeader

The main navigation header component.

#### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| transparent | `boolean` | `false` | Whether the header is transparent |
| fixed | `boolean` | `true` | Whether the header is fixed at the top |

#### Slots

| Name | Description |
|------|-------------|
| logo | Custom logo content |
| actions | Additional actions to display in the header |

#### Example

```vue
<AppHeader :transparent="isHomePage" :fixed="true">
  <template #actions>
    <ThemeToggle />
    <UserMenu />
  </template>
</AppHeader>
```

### AppFooter

The footer component with company information.

#### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| showSocialLinks | `boolean` | `true` | Whether to show social media links |
| showSitemap | `boolean` | `true` | Whether to show sitemap links |

#### Example

```vue
<AppFooter :showSocialLinks="true" :showSitemap="true" />
```

## Page-Specific Components

### HeroSection

A hero section component for the homepage.

#### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| title | `string` | `undefined` | Hero title |
| subtitle | `string` | `undefined` | Hero subtitle |
| backgroundImage | `string` | `undefined` | Background image URL |
| ctaText | `string` | `'Get Started'` | Call-to-action button text |
| ctaLink | `string` | `'#'` | Call-to-action button link |

#### Example

```vue
<HeroSection
  title="TransAIRobot"
  subtitle="The future of robot application management"
  backgroundImage="/images/hero-bg.jpg"
  ctaText="Explore Applications"
  ctaLink="/store"
/>
```

### ApplicationGrid

A grid component for displaying applications.

#### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| applications | `Array<Application>` | `[]` | List of applications to display |
| loading | `boolean` | `false` | Whether to show loading state |
| columns | `number` | `3` | Number of columns in the grid |
| showFilters | `boolean` | `true` | Whether to show filtering options |

#### Events

| Name | Parameters | Description |
|------|------------|-------------|
| select | `Application` | Emitted when an application is selected |
| filter | `FilterOptions` | Emitted when filters are changed |

#### Example

```vue
<ApplicationGrid
  :applications="applicationList"
  :loading="isLoading"
  :columns="4"
  :showFilters="true"
  @select="handleApplicationSelect"
  @filter="handleFilterChange"
/>
```

## Form Components

### FormInput

A form input component with validation.

#### Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | `undefined` | Input label |
| type | `'text'` \| `'email'` \| `'password'` \| `'number'` | `'text'` | Input type |
| value | `string` \| `number` | `''` | Input value |
| placeholder | `string` | `''` | Input placeholder |
| required | `boolean` | `false` | Whether the input is required |
| error | `string` | `undefined` | Error message to display |
| disabled | `boolean` | `false` | Whether the input is disabled |

#### Events

| Name | Parameters | Description |
|------|------------|-------------|
| input | `string` \| `number` | Emitted when the input value changes |
| blur | `Event` | Emitted when the input loses focus |

#### Example

```vue
<FormInput
  label="Email Address"
  type="email"
  v-model="email"
  placeholder="Enter your email"
  :required="true"
  :error="emailError"
  @blur="validateEmail"
/>
```

For more components and detailed usage examples, refer to the component source files in the `src/components` directory.
