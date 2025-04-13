# UI Modernization Plan: Dynamic & Responsive Layout

**Overall Goal:** Create a highly dynamic and responsive UI where users can adjust the layout proportions on larger screens, while ensuring smooth transitions, clear feedback, and visual consistency. The standard internal scrolling behavior will be maintained and refined.

## Phase 0: Setup & Prerequisites

1.  **Install Dependencies:** Add the necessary library for resizable panels.
    *   Action: Run `npm install react-resizable-panels` in the terminal.
2.  **Verify Tailwind v4 Configuration:** Ensure the project is correctly set up for Tailwind v4.
    *   Check `src/app/globals.css`: Confirm `@import "tailwindcss";` is present.
    *   Check `postcss.config.mjs`: Confirm it uses `plugins: { "@tailwindcss/postcss": {} }`.
    *   Check `tailwind.config.ts`: Ensure the `content` array correctly points to all files using Tailwind classes.
3.  **Ensure Root Layout Height Propagation:** Modify `src/app/layout.tsx` to ensure height is correctly passed down for `h-dvh` to work reliably.
    *   Action: Add `className="h-full"` to both the `<html>` and `<body>` tags.

## Phase 1: Implement Resizable Panels (Core Structure)

1.  **Refactor Main Layout (`src/app/page.tsx`):** Replace the existing CSS grid structure for larger screens (`lg:` and `xl:` breakpoints) with the `react-resizable-panels` components.
    *   Import `Panel`, `PanelGroup`, `PanelResizeHandle` from `react-resizable-panels`.
    *   Wrap the main content columns (Controls, Original Image, Generated Image) within a horizontal `<PanelGroup direction="horizontal">`.
    *   Each column `div` will become a `<Panel>`.
    *   Insert `<PanelResizeHandle />` components between the `<Panel>` components.
2.  **Apply Initial Styling and Constraints:**
    *   Use Tailwind classes (`bg-background`, `p-4`, etc.) directly on the `<Panel>` components for basic appearance.
    *   Style the `<PanelResizeHandle>` using Tailwind (e.g., `className="w-2 bg-border hover:bg-primary cursor-col-resize"`). Add visual indication during drag if desired.
    *   Set `defaultSize` prop on each `<Panel>` (e.g., in percentages or pixels) to define the initial layout proportions.
    *   Set `minSize` prop (e.g., in pixels or percentage) on each `<Panel>` to prevent columns from becoming too small when resized.
    *   The mobile view (`<div className="lg:hidden col-span-1">`) should remain outside this `PanelGroup` structure, continuing to use the simpler stacked layout.

## Phase 2: Apply Styling & Constraints to Panel Children

1.  **Controls Panel (`<Panel>` containing Upload, Customization, History):**
    *   Ensure the existing `flex flex-col space-y-4` structure is maintained *inside* the Panel.
    *   Apply `overflow-y-auto` to this Panel to allow its content (especially history) to scroll if it exceeds the panel's height after resizing.
    *   The `min-w-[value]` constraint should primarily be set on the `<Panel>` itself via the `minSize` prop.
2.  **Image Panels (`<Panel>` containing `ImageDisplayCard`):**
    *   Ensure the `ImageDisplayCard` component (and its parent `div` within the Panel) uses `h-full flex flex-col` to fill the panel's height.
    *   Inside `ImageDisplayCard.tsx`, confirm the `CardContent` and the image container `div` use `flex-grow` and `h-full` respectively, allowing the image area to adapt to the panel size.
    *   Apply `overflow-hidden` to these Panels to prevent unexpected content spill.
    *   Set appropriate `minSize` on these Panels.

## Phase 3: General Refinements & Polish

1.  **Transitions for ModelCustomization:**
    *   In `src/app/page.tsx`, wrap the conditionally rendered `ModelCustomization` Card with a `div`.
    *   Apply Tailwind transition utilities (`transition-opacity`, `duration-300`, `ease-in-out`) to this wrapper `div`.
    *   Conditionally apply `opacity-100` when `originalImage` is present and `opacity-0` when it's not.
2.  **Enhanced Loading/Error States:**
    *   In `ImageDisplayCard.tsx`, refine the `Skeleton` usage for a better visual effect (e.g., maybe a subtle pulse or shimmer).
    *   Make the error `Alert` more visually distinct or add more descriptive text based on the error type if available.
3.  **Consistency Audit:**
    *   Review all components involved (`ClothingUpload`, `ModelCustomization`, `ImageDisplayCard`, `GenerationHistory`, `page.tsx`) for consistent padding, margins, font sizes, and border radii across different states and breakpoints, especially considering the new resizable layout.

## Phase 4: Testing

1.  **Resizing:** Drag the handles extensively. Test edge cases (resizing quickly, resizing to min/max limits).
2.  **Constraints:** Verify that `minSize` props correctly prevent panels from becoming too small.
3.  **Content Overflow:** Ensure content within panels scrolls correctly (`overflow-y-auto`) when needed and doesn't break the layout. Check image scaling (`object-contain`) within `ImageDisplayCard`.
4.  **Responsiveness:** Check the layout below the `lg` breakpoint to ensure the original stacked mobile layout still works correctly.
5.  **Transitions & States:** Verify the `ModelCustomization` fade-in/out works smoothly. Test loading and error states in `ImageDisplayCard`.
6.  **Cross-browser:** Test the final layout and interactions in major browsers (Chrome, Firefox, Safari, Edge).

## Mermaid Diagram

```mermaid
graph TD
    subgraph Phase 0: Setup
        A[Install react-resizable-panels] --> B(Verify Tailwind v4 Setup);
        B --> C(Ensure Root Layout Height);
    end

    subgraph Phase 1: Core Resizable Structure
        D[Refactor page.tsx Layout] --> E(Wrap columns in PanelGroup/Panel);
        E --> F(Style PanelResizeHandle);
        F --> G(Set Panel defaultSize/minSize);
    end

    subgraph Phase 2: Style Panel Children
        H(Apply overflow/flex to Controls Panel) --> I(Ensure ImageDisplayCard fills height);
        I --> J(Apply flex-grow to CardContent);
        J --> K(Set minSize on Image Panels);
    end

    subgraph Phase 3: Refinements
        L(Add Transitions to ModelCustomization) --> M(Enhance Loading/Error States);
        M --> N(Perform Consistency Audit);
    end

    subgraph Phase 4: Testing
        O(Test Resizing & Constraints) --> P(Test Overflow & Scrolling);
        P --> Q(Test Transitions & States);
        Q --> R(Cross-browser Testing);
    end

    C --> D;
    G --> H;
    K --> L;
    N --> O;