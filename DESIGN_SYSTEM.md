# MST Design System - 2026 Glassmorphism Edition

## 🎨 Barevná paleta

### Brand Colors
```css
brand-500: #0ba5ec  /* Hlavní modrá */
accent-500: #a855f7  /* Fialová accent */
```

### Status Colors
```css
success-500: #10b981  /* Zelená - úspěch */
warning-500: #f59e0b  /* Oranžová - varování */
error-500: #f43f5e    /* Červená - chyba */
```

### Neutral Colors
```css
slate-50 - slate-950  /* Šedá škála s modrým nádechem */
```

## 🪟 Glassmorphism efekty

### Glass Card
```tsx
<Card variant="glass">
  Průhledná karta s blur efektem
</Card>
```

### Glass Button
```tsx
<Button variant="glass">
  Skleněné tlačítko
</Button>
```

### Glass Input
```tsx
<Input variant="glass" placeholder="Zadejte text..." />
```

## ✨ Gradienty

### Brand Gradient
```css
background: linear-gradient(135deg, #0ba5ec 0%, #a855f7 100%);
```

### Success Gradient
```css
background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
```

### Sunset Gradient
```css
background: linear-gradient(135deg, #f43f5e 0%, #f59e0b 100%);
```

## 🔘 Komponenty

### Buttons
```tsx
// Varianty
<Button variant="primary">Primární</Button>
<Button variant="secondary">Sekundární</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>
<Button variant="glass">Glass</Button>

// Gradient button
<GradientButton gradient="brand">Gradient</GradientButton>

// Velikosti
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// S ikonami
<Button leftIcon={<Icon />}>S ikonou</Button>

// Loading
<Button loading>Načítám...</Button>
```

### Cards
```tsx
// Varianty
<Card variant="glass">Glass karta</Card>
<Card variant="solid">Solid karta</Card>
<Card variant="outline">Outline karta</Card>
<Card variant="gradient">Gradient karta</Card>

// S hover efektem
<Card hover>Hover efekt</Card>

// S glow efektem
<Card glow>Glow efekt</Card>

// Feature Card
<FeatureCard
  icon={<SunIcon />}
  title="Statistika"
  value="42"
  trend={{ value: "+12%", positive: true }}
  gradient="success"
/>

// Stat Card
<StatCard
  label="Celkem"
  value="1,234"
  color="brand"
/>
```

### Inputs
```tsx
// Varianty
<Input variant="glass" label="Email" />
<Input variant="solid" label="Jméno" />
<Input variant="outline" label="Heslo" />

// Search input
<SearchInput
  placeholder="Hledat..."
  onClear={() => {}}
/>

// Password input
<PasswordInput label="Heslo" />

// TextArea
<TextArea label="Popis" rows={4} />
```

### Avatars
```tsx
// Velikosti
<Avatar size="xs" name="Jan Novák" />
<Avatar size="sm" name="Jan Novák" />
<Avatar size="md" name="Jan Novák" />
<Avatar size="lg" name="Jan Novák" />

// Se statusem
<Avatar name="Jan Novák" status="online" />
<Avatar name="Jan Novák" status="busy" />

// Skupina
<AvatarGroup
  avatars={[
    { name: 'Jan', src: '...' },
    { name: 'Petr' },
    { name: 'Anna' },
  ]}
  max={3}
/>

// S jménem
<UserAvatar
  name="Jan Novák"
  subtitle="Pracovník"
  status="online"
/>
```

### Modals
```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Titulek"
  subtitle="Popis"
  size="md"
>
  <p>Obsah modalu</p>
  <ModalFooter>
    <Button variant="secondary" onClick={onClose}>Zrušit</Button>
    <Button onClick={onConfirm}>Potvrdit</Button>
  </ModalFooter>
</Modal>

// Alert
<AlertModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={onConfirm}
  title="Smazat?"
  message="Opravdu chcete smazat položku?"
  variant="danger"
/>
```

### Toasts
```tsx
// V komponentě
const { success, error, warning, info } = useToast();

// Použití
success('Uloženo!', 'Data byla uložena');
error('Chyba', 'Něco se pokazilo');
warning('Pozor', 'Pozor na tuto akci');
info('Info', 'Informační zpráva');
```

### TabBar
```tsx
<TabBar
  items={DEFAULT_TAB_ITEMS}
  activeId="home"
  onChange={(id) => setActiveTab(id)}
  variant="floating"
/>
```

## 🎬 Animace

### Dostupné animace
```css
animate-fade-in       /* Fade in */
animate-slide-up      /* Slide ze spodu */
animate-slide-down    /* Slide shora */
animate-scale-in      /* Scale in */
animate-bounce-in     /* Bounce efekt */
animate-pulse-soft    /* Jemné pulsování */
animate-shimmer       /* Shimmer loading */
animate-glow          /* Glow efekt */
animate-float         /* Floating efekt */
```

## 📐 Spacing & Layout

### Border Radius
```css
rounded-sm: 8px
rounded-md: 12px
rounded-lg: 16px
rounded-xl: 20px
rounded-2xl: 24px
rounded-3xl: 32px
```

### Shadows
```css
shadow-glass         /* Základní glass shadow */
shadow-glass-lg      /* Větší glass shadow */
shadow-card          /* Card shadow */
shadow-card-hover    /* Card hover shadow */
shadow-glass-glow    /* Glow efekt */
```

### Safe Areas
```css
safe-area-top        /* iOS safe area top */
safe-area-bottom     /* iOS safe area bottom */
```

## 🌙 Dark Mode

Všechny komponenty podporují dark mode automaticky.

```tsx
// V globals.css jsou definované CSS proměnné
// které se mění podle .dark třídy

// Příklad použití
className="bg-white dark:bg-slate-900"
className="text-slate-900 dark:text-white"
```

## 📱 Mobile First

Design systém je optimalizovaný pro mobilní zařízení:
- Touch targets minimálně 44x44px
- Swipe gesta
- Safe area podpora pro notch
- Haptic feedback ready

## 🆕 Pokročilé komponenty

### Progress Ring
```tsx
<ProgressRing 
  value={75} 
  color="success" 
  glow 
  gradient 
/>
```

### Stats Card
```tsx
<StatsCard
  label="Dokončeno"
  value={1234}
  change={{ value: 12 }}
  color="brand"
  variant="gradient"
  animated
/>
```

### Tabs & Segmented Control
```tsx
<Tabs
  tabs={[
    { id: 'all', label: 'Vše', badge: 5 },
    { id: 'active', label: 'Aktivní' },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
  variant="pills"
/>

<SegmentedControl
  options={[
    { value: 'day', label: 'Den' },
    { value: 'week', label: 'Týden' },
    { value: 'month', label: 'Měsíc' },
  ]}
  value={period}
  onChange={setPeriod}
/>
```

### Slider
```tsx
<Slider
  value={50}
  onChange={setValue}
  min={0}
  max={100}
  color="brand"
  showValue
  label="Hlasitost"
/>
```

### Tooltip & Popover
```tsx
<Tooltip content="Nápověda" position="top">
  <Button>Hover me</Button>
</Tooltip>

<Popover content={<MenuContent />}>
  <Button>Otevřít menu</Button>
</Popover>
```

### Accordion
```tsx
<Accordion
  items={[
    { id: '1', title: 'Sekce 1', content: <p>Obsah</p> },
    { id: '2', title: 'Sekce 2', content: <p>Obsah</p> },
  ]}
  variant="card"
/>
```

### DatePicker
```tsx
<DatePicker
  value={date}
  onChange={setDate}
  label="Datum"
  minDate={new Date()}
/>
```

### Select & MultiSelect
```tsx
<Select
  options={[
    { value: '1', label: 'Možnost 1' },
    { value: '2', label: 'Možnost 2' },
  ]}
  value={selected}
  onChange={setSelected}
  searchable
  clearable
/>

<MultiSelect
  options={options}
  value={selectedItems}
  onChange={setSelectedItems}
  max={5}
/>
```

### FileUpload
```tsx
<FileUpload
  accept="image/*"
  multiple
  maxSize={5 * 1024 * 1024}
  onUpload={handleUpload}
  files={uploadedFiles}
  onRemove={handleRemove}
/>
```

## 📊 Celkový přehled komponent

| Kategorie | Komponenty |
|-----------|------------|
| **Layout** | Screen, Card, Section, Grid, BottomSheet, Modal |
| **Navigation** | TabBar, Tabs, Accordion |
| **Inputs** | Button, Input, Select, Slider, DatePicker, FileUpload, Toggle |
| **Feedback** | Toast, Badge, ProgressRing, Loading, ErrorState |
| **Data Display** | StatsCard, Avatar, List, Timeline |
| **Overlays** | Modal, Tooltip, Popover, DropdownMenu |
