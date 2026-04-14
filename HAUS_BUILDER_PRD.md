# HAUS BUILDER — Product Requirements Document
> Version 1.0 | Desktop-only | No sign-up | PNG export
> Stack: Next.js 14 · React Three Fiber · Mistral AI · Zustand · Tailwind

---

## 1. PRODUCT OVERVIEW

Haus Builder is a web-based architectural design tool that lets anyone — with zero CAD knowledge — design a full home or individual room in 3D. Two entry paths, one shared viewer.

**Core promise:** From blank page to furnished 3D home in under 3 minutes.

---

## 2. TWO ENTRY MODES

### Mode A — Build with AI
```
Quiz (5–7 questions, Mistral Small) 
  → Cinematic loading screen 
  → Architect Agent (Mistral Large) generates DesignSpec 
  → Interactive 3D Viewer
  → User adjusts rooms + furniture with cursor
```

### Mode B — Build Yourself
```
Blank 3D canvas 
  → Sidebar library (rooms, walls, doors/windows, furniture, structure) 
  → Drag-drop / type-to-add
  → Same interactive viewer
  → Optional: "Refine with AI" button
```

Both modes converge on the **same viewer** and **same interaction model**.

---

## 3. SCOPE DEFINITION

| Feature | In Scope | Out of Scope |
|---|---|---|
| Full house design | ✅ | |
| Single room design | ✅ | |
| PNG export | ✅ | .glTF, .obj, PDF |
| 3D / 2D / Exploded / X-ray views | ✅ | |
| Room + furniture cursor movement | ✅ | |
| Snap-to-grid toggle | ✅ | |
| Dark / light mode | ✅ | |
| Mobile | ❌ | Desktop only |
| Sign-up / auth | ❌ | |
| Shareable links | ❌ | |
| Multiplayer | ❌ | |

---

## 4. USER FLOW

### 4A. Home Screen
- Minimal hero: "Design your home. Instantly." 
- Two equal cards: **Build with AI** | **Build Yourself**
- Theme toggle top-right
- No nav, no footer clutter

### 4B. Build with AI — Quiz
- 5–7 adaptive questions max (hard cap)
- Q1: Space type → full house or single room?
- Q2: How many people will live here?
- Q3: Lifestyle descriptor (minimalist / family-oriented / entertainer / work-from-home)
- Q4: Preferred style (shown as visual chips: Modernist / Japandi / Industrial / Mediterranean / Scandinavian / Brutalist / Mid-Century / Craftsman)
- Q5: Budget tier (affects room count + furniture density)
- Q6–7: Conditional — only asked if house (floor count, outdoor space priority)
- Each answer shapes the next question
- Progress bar: dots, 1 per question

### 4C. Cinematic Generation Screen
- Full viewport, dark background (#0E0D14 always)
- Animated progress bar (real progress tied to API state)
- Stage labels cycle: "Reading your brief..." → "Planning spaces..." → "Placing structure..." → "Furnishing rooms..." → "Final touches..."
- Two API calls fire concurrently:
  - POST /api/agent/plan → ArchitectBrief (fast, Mistral Small or Large Small)
  - POST /api/agent/design → DesignSpec (main output, Mistral Large)
- Minimum 4s cinematic, max waits for both to resolve
- On success → route to /viewer

### 4D. 3D Viewer (both modes)
- Isometric-ish camera start: position [22, 18, 22], fov 45
- OrbitControls: orbit + zoom + pan
- Bottom control bar: ORBIT | EXPLODE | X-RAY | MATERIAL | 2D
- Top-left: ← Modes button
- Top-right: style name badge + mode badge (AI MODE v1 or MANUAL)
- Click any room or furniture item → selection highlight → drag to move
- Snap toggle in toolbar
- PNG export button in toolbar

---

## 5. ARCHITECT AGENT — DESIGN INTELLIGENCE

### Architectural Knowledge Base (baked into system prompt)

The architect agent must internalize the following styles — geometry rules, spatial logic, proportion systems:

#### MODERNIST
- Flat or butterfly roof
- Open floor plan, continuous living/kitchen/dining
- Floor-to-ceiling windows on south face
- Cantilevered upper floor (0.8–1.2m overhang)
- Palette: whites, concrete grey, single accent
- Ceiling height: 3.0–3.5m

#### JAPANDI
- Low ceiling height: 2.4–2.6m (creates intimacy)
- Engawa corridor (transitional indoor-outdoor strip, 1.2m wide)
- Sliding doors instead of swing doors
- Tatami room: 3.6×3.6m or 4.5×3.6m
- Restrained palette: warm whites, raw timber, sage, stone
- Minimal furniture, generous negative space

#### INDUSTRIAL
- Exposed mezzanine level (partial upper floor, 40–60% of ground footprint)
- Ceiling height: 3.5m+ ground floor
- Open staircase (floating treads, visible railing)
- Large factory-style windows: wide, horizontally divided
- Raw material palette: concrete, steel, dark timber

#### MEDITERRANEAN
- Central courtyard room (open-top, 4×4m minimum)
- Arched door openings (door height 2.4m, arch adds 0.4m)
- Terracotta and white palette
- Covered loggia/colonnade on south side
- Thicker proportions (rooms slightly squarer than northern styles)

#### SCANDINAVIAN
- Steep pitched roof with dormers
- Compact rooms: max 4.5×5m (efficient, warm)
- Covered entrance porch (1.5×2m)
- Birch/pine palette, white walls, pops of muted color
- Ceiling height: 2.6–2.8m

#### BRUTALIST
- Upper floor cantilevered beyond lower floor: 1.5m minimum overhang
- Exposed concrete geometry, strong shadow lines
- Narrow vertical window slits OR full horizontal ribbon windows
- Monolithic forms, limited material variation
- Ceiling: 3.0m+, heavy proportions

#### MID-CENTURY MODERN
- Low-pitched or flat roof with wide eaves (0.6–1.0m overhang)
- Strong horizontal emphasis
- Post-and-beam structure: tall windows between structural posts
- Split-level floor plans (0.4–0.6m level changes)
- Palette: warm wood tones, olive, mustard, terracotta

#### CRAFTSMAN
- Steep gable roof (40–45° pitch)
- Covered front porch with tapered columns (2×4m porch)
- Bay window in living room (projects 0.6m outward)
- Exposed rafter tails at roofline
- Warm wood palette, earthy tones

#### BIOPHILIC
- Indoor garden room or atrium (skylight above)
- Maximum window-to-wall ratio (70%+ of exterior walls glazed)
- Curved or organic room shapes where possible
- Green wall integration in kitchen/living
- Natural palette: stone, wood, moss green

### Interior Design Dimension Rules (MUST follow)
```
Bedroom:       min 3.0×3.5m (single), 4.0×4.5m (master)
Living room:   min 4.5×5.5m, allow 6×7 for large homes
Kitchen:       min 2.5×4.0m (galley), 4×5 (open plan)
Bathroom:      min 1.8×2.4m (WC only), 2.4×3.0m (full)
Dining room:   min 3.5×4.0m (fits 6-person table)
Office:        min 3.0×3.5m
Hallway:       width min 1.2m, never wider than 1.8m
Ceiling:       2.6m (compact), 2.8m (standard), 3.2m+ (grand)

Furniture clearance rules:
  Bed → 0.9m on both long sides, 0.6m at foot
  Sofa → 1.2m clear in front for coffee table + passage
  Dining table → 0.9m clear on all sides
  Kitchen counter → 1.0m aisle minimum between facing counters
```

### Room Adjacency Rules (spatial logic)
```
Kitchen MUST be adjacent to: Dining Room, Pantry
Living Room SHOULD be adjacent to: Dining Room, Entry
Master Bedroom SHOULD be adjacent to: Master Bathroom
All Bedrooms SHOULD be adjacent to: Hallway
Bathrooms MUST NOT be adjacent to: Kitchen, Dining
Garage (if present) SHOULD connect to: Hallway or Mudroom
Staircase MUST connect: all floors via Hallway
```

---

## 6. DATA MODELS

### UserProfile
```typescript
interface UserProfile {
  spaceType: 'house' | 'room'
  roomType?: string              // if spaceType = 'room'
  occupants: { adults: number; children: number }
  lifestyle: 'minimalist' | 'family' | 'entertainer' | 'work-from-home'
  style: ArchStyle
  budget: 'low' | 'medium' | 'high' | 'luxury'
  floors?: 1 | 2 | 3            // if spaceType = 'house'
  outdoorPriority?: boolean
}

type ArchStyle = 'modernist' | 'japandi' | 'industrial' | 'mediterranean' 
               | 'scandinavian' | 'brutalist' | 'mid-century' 
               | 'craftsman' | 'biophilic'
```

### DesignSpec (drives 3D renderer — source of truth)
```typescript
interface DesignSpec {
  id: string
  version: number
  style: ArchStyle
  floors: Floor[]
  roofType: 'flat' | 'gabled' | 'monopitch' | 'butterfly' | 'hippped'
  totalArea: number
  generatedAt: string
}

interface Floor {
  level: number                  // 0 = ground
  height: number                 // ceiling height, 2.4–3.5
  rooms: Room3D[]
}

interface Room3D {
  id: string
  type: RoomType
  label: string
  position: { x: number; z: number }   // y derived from floor.level
  dimensions: { w: number; d: number } // height = floor.height
  color: string                         // from palette
  rotation: number                      // Y-axis, 0 | 90 | 180 | 270
  windows: Window3D[]
  doors: Door3D[]
  furniture: FurnitureItem[]
}

interface Window3D {
  wall: 'north' | 'south' | 'east' | 'west'
  offsetX: number               // 0–1 normalized along wall
  width: number
  height: number
  sillHeight: number            // from floor, typically 0.9
}

interface Door3D {
  wall: 'north' | 'south' | 'east' | 'west'
  offsetX: number
  width: number                 // 0.9 standard, 1.2 double
  connectsTo: string            // room id or 'exterior'
  swingDirection: 'inward' | 'outward'
}

interface FurnitureItem {
  id: string
  type: FurnitureType
  position: { x: number; z: number }   // relative to room center
  rotation: number
  dimensions: { w: number; d: number; h: number }
}
```

---

## 7. AI AGENT SPECS

### Agent 1 — Quiz Agent (Mistral Small, temp 0.7)
**Purpose:** Intake interviewer. Fast, conversational, adaptive.

```
System prompt:
You are an architectural intake consultant for Haus Builder.
Conduct a SHORT, friendly intake interview to understand the user's ideal space.

RULES:
- ONE question per turn. Never two.
- Start with spaceType (house vs room). Every subsequent question adapts to the answer.
- Max 7 questions. Min 5.
- Questions flow: space type → occupants → lifestyle → style → budget → conditional extras
- Style question: ALWAYS provide visual options: modernist, japandi, industrial, 
  mediterranean, scandinavian, brutalist, mid-century, craftsman, biophilic
- ALWAYS respond in JSON only. No prose. No markdown.

Response format:
  Question: { "type": "question", "content": string, "inputType": "choice" | "text" | "number", "options": string[] }
  Done:     { "type": "complete", "profile": UserProfile }
```

### Agent 2 — Architect Agent (Mistral Large, temp 0.25)
**Purpose:** Convert UserProfile → valid DesignSpec with proper geometry.

```
System prompt:
You are a senior architect with deep knowledge of spatial design, 
human-scale dimensions, and furniture ergonomics.
Convert the UserProfile into a precise DesignSpec for a 3D renderer.

GEOMETRY RULES (never violate):
1. Rooms are axis-aligned rectangles. No overlapping bounding boxes.
2. Adjacent rooms share a wall face (touching, not floating, not overlapping).
3. Every room has min 1 door. Every exterior room has min 1 window (not bathrooms).
4. Ground floor MUST have 1 outdoor transition space (patio / terrace / garden).
5. Rooms follow interior design dimension minimums (see rules above).
6. Furniture placement follows clearance rules.
7. Positions are in meters. Room center = position point.
8. Floor[1+] positions: same x/z grid, y = sum of all floor heights below.

STYLE RULES (apply based on profile.style):
- [Full style-specific rules from Section 5 above, condensed as bullet lists]

PALETTE (use only these, no adjacent rooms same color):
#C4C3E3 #504E76 #FDF8E2 #A3B565 #FCDD9D #F1642E #B8B4D0 #E8E4C8

OUTPUT: JSON only. No markdown fences. No prose. No explanation.
On parse fail: strip fences, retry. Max 3 retries with simplified geometry.
```

---

## 8. 3D RENDERER — TECHNICAL SPEC

### Canvas Setup
```tsx
<Canvas
  shadows="soft"
  camera={{ fov: 45, position: [22, 18, 22], near: 0.1, far: 500 }}
  dpr={[1, 1.5]}
  gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.08 }}
  style={{ background: 'var(--viewer-bg)' }}
  eventSource={document.getElementById('canvas-root')!}
  eventPrefix="client"
>
```

### Lighting (budget-conscious)
```tsx
<ambientLight intensity={0.35} color="#FDF8E2" />
<directionalLight position={[20, 40, 15]} intensity={1.2} castShadow
  shadow-mapSize={[1024, 1024]}   // 1024 not 2048 — performance
  shadow-camera-far={80} shadow-bias={-0.001} />
<hemisphereLight args={["#C4C3E3", "#A3B565", 0.4]} />
// NO per-window spot lights — too expensive. Use directional only.
```

### RoomMesh — Thin Walls (simple)
```
group at room world position
  ├── floor   PlaneGeometry(w,d)  rotateX(-90°) receiveShadow
  ├── wall-N  BoxGeometry(w, h, 0.08)  positioned at north edge
  ├── wall-S  BoxGeometry(w, h, 0.08)  positioned at south edge
  ├── wall-E  BoxGeometry(0.08, h, d)  positioned at east edge
  ├── wall-W  BoxGeometry(0.08, h, d)  positioned at west edge
  ├── ceiling PlaneGeometry(w,d) rotateX(90°) opacity=0.15 transparent
  ├── windows WindowMesh[]
  ├── doors   DoorMesh[]
  └── furniture FurnitureFactory[]
```
All geometry in `useMemo([w, d, h])`. `React.memo` on RoomMesh.
Wall gaps for doors/windows: rendered as dark plane (not actual hole — complexity reduction).

### Views
```
3D (default):   OrbitControls, isometric start, shadows on
2D:             camera.position = [0, 60, 0.01], orthographic projection, 
                shadows off, room labels visible, dimension lines
EXPLODE:        floors separate by 6.5m on Y, spring animation (react-spring)
                dashed corner lines (LineDashedMaterial, #1A56DB)
                floor labels via Drei Html → portal
X-RAY:          ceiling opacity → 0, wall opacity → 0.18, 
                furniture fully visible, ambient intensity +0.3
```

### Material Presets (cycle button)
```
CONCRETE:  roughness=0.88, metalness=0.02, color multiply #B8B8B8
TIMBER:    roughness=0.72, metalness=0.0,  color multiply #C4914A  
BRICK:     roughness=0.94, metalness=0.0,  color multiply #B85C42
```

### Furniture — Primitives Only
```
BED:       frame(Box) + mattress(Box) + headboard(Box) + pillows(Box×2)
SOFA:      base(Box) + back(Box) + arms(Box×2) + cushions(Box×2)
DESK:      top(Box) + legs(Cylinder×4) + monitor(Box) + stand(Box)
DINING:    table(Box+Cyl×4) + chairs(Box×4, each seat+back)
KITCHEN:   counter(Box) + upper cabinet(Box) + sink(Cylinder)
BATHTUB:   outer(Box) + inner(Box) + faucet(Cyl+Sphere)
TOILET:    bowl(Cylinder) + tank(Box)
WARDROBE:  body(Box) + doors(Box×2)
BOOKSHELF: body(Box) + shelves(Box×4) + books(Box×8 random palette)
PLANT:     pot(Cylinder) + soil(Cylinder) + stem(Cylinder) + leaves(Sphere×3, #A3B565)
LAMP:      base(Cylinder) + pole(Cylinder) + shade(Cone)
STAIR:     8× step(Box) stacked + offset + handrail(Cylinder)
```

### Selection + Transform (cursor interaction)
```
Click room or furniture → emissive glow highlight (0.15)
Drag → raycast vs XZ floor plane → update position
  → if snap ON: snap to 0.5m grid
  → if snap OFF: free position
Room selection: drag whole group
Furniture selection: drag within room (stays within room bounds)
Escape → deselect
Delete → remove item (with undo)
```

---

## 9. BUILD YOURSELF MODE — SIDEBAR

### Asset Categories
```
ROOMS:      Bedroom, Living Room, Kitchen, Bathroom, Office,
            Dining Room, Hallway, Garage
WALLS:      Short (2m), Medium (4m), Long (6m)
OPENINGS:   Door Single, Door Double, Window Small, Window Large
FURNITURE:  Bed King, Bed Single, Sofa, Desk, Dining Set,
            Kitchen Counter, Bathtub, Toilet, Wardrobe,
            Bookshelf, Plant, Lamp, Stair
```

### Interaction
```
Drag from sidebar → drop on canvas floor plane
"Type to add" input: matches asset name → drops at canvas center
  e.g., "add sofa" → SofaItem appears at (0, 0, 0) → user drags to position
Select → move → snap toggle → delete
Undo/Redo: Cmd+Z / Cmd+Shift+Z (max 50 states)
```

### "Refine with AI" Button
```
builderStore.toDesignSpec() → POST /api/agent/design
  instruction: "Refine this layout, add missing furniture, fix spatial issues"
→ router.push('/viewer') with refined spec
```

---

## 10. EXPORT

```
Button: "Export PNG" in toolbar
Captures: gl.domElement.toDataURL('image/png')
Filename: haus-builder-{style}-{timestamp}.png
Triggers browser download
No backend needed
```

---

## 11. UI DESIGN SYSTEM

### Colors
All via CSS vars — zero hardcoded hex in any .tsx file.

```css
:root {
  --bg:            #FDF8E2;
  --surface:       #FFFFFF;
  --surface-2:     #F5F0D8;
  --border:        rgba(196,195,227,0.35);
  --border-strong: rgba(80,78,118,0.4);
  --text-primary:  #1A1828;
  --text-secondary:#504E76;
  --text-muted:    rgba(80,78,118,0.55);
  --accent:        #1A56DB;
  --accent-hover:  #1344B8;
  --accent-soft:   rgba(26,86,219,0.12);
  --violet-light:  #C4C3E3;
  --violet-dark:   #504E76;
  --sage:          #A3B565;
  --peach:         #FCDD9D;
  --orange:        #F1642E;
  --glass-bg:      rgba(253,248,226,0.68);
  --glass-border:  rgba(196,195,227,0.35);
  --viewer-bg:     #EDE8D0;
}
.dark {
  --bg:            #0E0D14;
  --surface:       #16141F;
  --surface-2:     #1E1B2E;
  --border:        rgba(196,195,227,0.12);
  --border-strong: rgba(196,195,227,0.25);
  --text-primary:  #EDE9F5;
  --text-secondary:#C4C3E3;
  --text-muted:    rgba(196,195,227,0.45);
  --glass-bg:      rgba(14,13,20,0.75);
  --glass-border:  rgba(196,195,227,0.14);
  --viewer-bg:     #0E0D14;
}
```

### Glass utility
```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(16px) saturate(1.4);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  border: 1px solid var(--glass-border);
}
```
Apply to: ControlBar, HoverPrompt, mode badge, builder overlays.

### Typography
```
Cormorant Garamond  → headings, quiz questions
Space Grotesk       → body, UI, buttons
Space Mono          → specs, labels, room tags, floor labels
```

---

## 12. STATE MANAGEMENT (Zustand)

```typescript
// quizStore
{ messages, currentQuestion, inputType, options, questionCount, 
  isLoading, isComplete, profile }

// designStore  
{ design: DesignSpec|null, history: DesignSpec[], isGenerating, error }
actions: setDesign, setGenerating, setError, undo (for versioning)

// viewerStore
{ viewMode: '3d'|'2d'|'exploded'|'xray',
  materialPreset: 'concrete'|'timber'|'brick',
  snapEnabled: boolean,
  selectedId: string|null }

// builderStore
{ items: BuilderItem[], selectedId: string|null,
  history: BuilderItem[][], historyIndex: number }
actions: addItem, removeItem, updateItem, selectItem, undo, redo, toDesignSpec
```

---

## 13. FILE STRUCTURE

```
/src
  /app
    layout.tsx                  ← fonts, theme provider, CSS vars
    page.tsx                    ← home screen (two mode cards)
    /quiz/page.tsx              ← quiz phase
    /viewer/page.tsx            ← 3D viewer
    /builder/page.tsx           ← manual builder
    /api
      /agent/quiz/route.ts      ← POST → Mistral Small (quiz)
      /agent/plan/route.ts      ← POST → quick brief (optional fast phase)
      /agent/design/route.ts    ← POST → Mistral Large (full DesignSpec)
  /components
    /quiz
      QuizShell.tsx
      QuestionCard.tsx
      ProgressDots.tsx
      ChoiceInput.tsx
      TextInput.tsx
    /cinematic
      CinematicLoader.tsx       ← loading screen with progress bar + stage labels
    /viewer
      SceneCanvas.tsx           ← Canvas setup, lighting, controls
      HouseModel.tsx            ← maps DesignSpec.floors → RoomMesh[]
      RoomMesh.tsx              ← floor + walls + ceiling + furniture
      WindowMesh.tsx
      DoorMesh.tsx
      FurnitureFactory.tsx      ← routes type → component
      furniture/               ← Bed, Sofa, Desk, Dining, etc.
      ControlBar.tsx            ← bottom toolbar (glass)
      ExplodedView.tsx          ← spring animation + dashed lines + labels
    /builder
      BuilderSidebar.tsx        ← 4 categories + type-to-add input
      AssetCard.tsx
      BuilderCanvas.tsx
    /ui
      ThemeToggle.tsx
      Button.tsx
      GlassPanel.tsx
  /hooks
    useQuizAgent.ts
    useArchitectAgent.ts
    useDesignInteraction.ts     ← selection + drag + snap
  /lib
    mistral.ts
    schemas.ts                  ← Zod: UserProfile, DesignSpec
    architectPrompt.ts          ← full system prompt with style knowledge
    quizPrompt.ts
  /store
    quizStore.ts
    designStore.ts
    viewerStore.ts
    builderStore.ts
  /types
    index.ts                    ← all types in one file (simpler)
```

---

## 14. PERFORMANCE RULES (non-negotiable)

```
1. ALL Three.js geometry in useMemo(). Never in render body.
2. React.memo on RoomMesh, WindowMesh, DoorMesh, all furniture.
3. dpr={[1, 1.5]} — never higher.
4. NO SpotLights — directional + ambient + hemi only.
5. Shadow map: 1024×1024, never 2048.
6. Max geometry per scene: 500 meshes. Prune furniture for large designs.
7. API responses: strip markdown fences before JSON.parse().
8. Zustand selectors: always s => s.specificField (not whole store).
```

---

## 15. IMPLEMENTATION ORDER

```
PHASE 1 — Foundation (no 3D yet)
  1.  Next.js 14 project scaffold + TypeScript strict
  2.  globals.css — all tokens, .glass utility, font imports
  3.  Zustand stores (all 4)
  4.  Zod schemas (UserProfile + DesignSpec)
  5.  Home screen — two mode cards, ThemeToggle

PHASE 2 — AI Pipeline
  6.  /api/agent/quiz route + quizPrompt.ts
  7.  /api/agent/design route + architectPrompt.ts (full style knowledge)
  8.  useQuizAgent hook
  9.  useArchitectAgent hook
  10. Quiz UI — QuizShell, QuestionCard, ChoiceInput, ProgressDots
  11. CinematicLoader — progress bar, stage labels, concurrent API calls

PHASE 3 — 3D Viewer Core
  12. SceneCanvas — Canvas setup, lighting, OrbitControls
  13. RoomMesh — floor + 4 walls + transparent ceiling (useMemo all geo)
  14. HouseModel — maps DesignSpec → RoomMesh array
  15. WindowMesh + DoorMesh (visual only, dark plane cutout style)
  16. FurnitureFactory + all 13 furniture types (primitive boxes/cyls)
  17. ControlBar — glass, all 5 buttons wired

PHASE 4 — Views + Interaction
  18. ViewMode switching (3D/2D/Explode/X-ray)
  19. Exploded view — spring animation + dashed lines + floor labels
  20. Selection — click → highlight → drag → snap toggle
  21. Material preset cycling
  22. PNG export

PHASE 5 — Build Yourself Mode
  23. /builder route + BuilderSidebar (4 categories)
  24. Drag-drop from sidebar → canvas (dnd-kit)
  25. Type-to-add input → center drop
  26. Builder transform handles (move, delete)
  27. Undo/redo
  28. "Refine with AI" → design agent → viewer

PHASE 6 — Polish
  29. Full token audit (zero hardcoded hex anywhere)
  30. Light + dark mode test on every screen
  31. Performance pass (check memo, dpr, mesh count)
  32. npm run build clean
```

---

## 16. PACKAGES

```bash
npm install @react-three/fiber @react-three/drei three
npm install @react-spring/three              # exploded view animation
npm install @dnd-kit/core @dnd-kit/utilities # builder drag-drop
npm install zustand zod                      # state + validation
npm install framer-motion                    # UI transitions only
npm install lucide-react                     # icons
npm install @mistralai/mistralai             # Mistral SDK
```

---

## 17. QUALITY GATES (before ship)

```
□ All hex in .tsx → var(--token)
□ Quiz: 5 questions minimum, 7 maximum, never more
□ DesignSpec: always valid Zod parse before 3D render
□ OrbitControls work after every Canvas change
□ Viewer bg = --viewer-bg never #000000
□ ControlBar glass effect visible light + dark
□ Furniture visible in at least 3 room types
□ Exploded: floor labels visible, dashed lines animate
□ X-ray: walls transparent, furniture fully visible
□ 2D: flat top view, room labels show
□ PNG export: file downloads correctly
□ Type-to-add: item appears at canvas center
□ Snap toggle works in both free + grid modes
□ Build clean: 0 type errors, 0 warnings
□ Light mode + dark mode: both readable everywhere
□ Performance: no lag on orbit with 8+ room design
```

---

*Haus Builder · PRD v1.0 · Ready to build on your instruction*
