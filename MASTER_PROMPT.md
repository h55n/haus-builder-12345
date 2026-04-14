# HAUS BUILDER — MASTER PROMPT
> /caveman full | Feed to any LLM to resume or extend project

---

## WHAT

3D web home designer. Two modes:
- **AI** → quiz (Mistral Small) → DesignSpec (Mistral Large) → 3D viewer
- **Manual** → drag-drop sidebar → same viewer

Stack: Next.js 14, R3F/Three.js, Zustand, Zod, Mistral, dnd-kit, react-spring.

---

## COLOR TOKENS (CSS vars — zero hardcode in .tsx)

```
--bg #FDF8E2 | dark #0E0D14
--surface #FFFFFF | dark #16141F
--surface-2 #F5F0D8 | dark #1E1B2E
--accent #1A56DB
--violet-dark #504E76
--sage #A3B565
--peach #FCDD9D
--orange #F1642E
--viewer-bg #EDE8D0 | dark #0E0D14
```

## FONTS

```
--font-cormorant     → headings, quiz questions
--font-space-grotesk → body, UI, buttons
--font-space-mono    → specs, labels, room tags
```

---

## DATA FLOW

```
Quiz → UserProfile (Zod) → POST /api/agent/design → DesignSpec (Zod)
     → designStore.setDesign() → HouseModel renders floors[]→rooms[]→RoomMesh
```

## KEY TYPES

```typescript
DesignSpec { id, version, style: ArchStyle, floors: Floor[], roofType, totalArea }
Floor      { level: 0+, height: 2.4–4.2m, rooms: Room3D[] }
Room3D     { id, type, label, position:{x,z}, dimensions:{w,d}, color, rotation,
             windows: Window3D[], doors: Door3D[], furniture: FurnitureItem[] }
```

---

## ARCHITECT AGENT — CORE RULES

Model: `mistral-large-latest`, temp 0.25. Output JSON only, no fences.

### Geometry
1. Rooms axis-aligned rectangles. No overlaps.
2. Adjacent rooms share wall face (touching exactly).
3. Every room: min 1 door. Exterior rooms: min 1 window (not bathrooms).
4. Ground floor: 1 outdoor space (patio/terrace/courtyard).
5. Positions = room centers in meters.

### Style geometry rules
```
modernist:    flat/butterfly roof, 3.0–3.5m ceiling, floor-ceiling windows south face
japandi:      2.4–2.6m ceiling, engawa corridor 1.2m, tatami 3.6×3.6m
industrial:   3.5m+ ceiling, mezzanine floor[1] 40–60% footprint, wide windows
mediterranean:courtyard room 4×4m open-top, arched doors, loggia south
scandinavian: gabled roof, compact rooms max 4.5×5m, porch 1.5×2m
brutalist:    flat roof, upper floor +1.5m overhang, ribbon or slit windows
mid-century:  monopitch/flat roof, split level +0.4–0.6m, post-and-beam windows
craftsman:    gabled roof, porch 2×4m, bay window living room +0.6m projection
biophilic:    atrium room skylight, 70%+ glazed walls, curved shapes
```

### Dimensions (min)
```
master bed 4.0×4.5 | bed 3.0×3.5 | living 4.5×5.5 | kitchen 2.5×4.0
bath 1.8×2.4 | dining 3.5×4.0 | office 3.0×3.5 | hallway 1.2–1.8m wide
```

### Budget → scale
```
low:    5–7 rooms, 1 floor, ~80–100m²
medium: 7–10 rooms, 1–2 floors, ~120–160m²
high:   10–13 rooms, 2 floors, ~180–240m²
luxury: 13–18 rooms, 2–3 floors, ~280–400m²
```

### Palette
`#C4C3E3 #504E76 #FDF8E2 #A3B565 #FCDD9D #F1642E #B8B4D0 #E8E4C8`
No adjacent rooms same color.

---

## 3D RENDERER

```
Canvas: dpr[1,1.5], shadows soft, ACESFilmic tone, eventSource canvas-root div
Lights: ambient 0.35 #FDF8E2 + directional [20,40,15] 1.2 shadow 1024 + hemi #C4C3E3/#A3B565 0.4
NO SpotLights.
RoomMesh: floor(Plane) + 4 walls(Box 0.08 thick) + ceiling(Plane 0.15 opacity) + windows + doors + furniture
ALL geo in useMemo. React.memo on RoomMesh (compare room.id+position+color+materialPreset).
```

## VIEWS

```
3d       → OrbitControls, shadow on
2d       → OrthographicCamera [0,60,0.01], shadow off
exploded → floors Y += i*6.5, react-spring tension:50 friction:18, dashed corner lines
xray     → wall opacity 0.18, ceiling opacity 0, ambient +0.3
```

## MATERIAL PRESETS (cycle button)

```
concrete: roughness 0.88, metalness 0.02, tint #B8B8B8
timber:   roughness 0.72, metalness 0.0,  tint #C4914A
brick:    roughness 0.94, metalness 0.0,  tint #B85C42
```

---

## STORES

```
quizStore:    messages, currentQuestion, questionCount, isLoading, isComplete, profile
designStore:  design: DesignSpec|null, isGenerating, error
viewerStore:  viewMode, materialPreset, snapEnabled, selectedId
builderStore: items: BuilderItem[], selectedId, history[][], historyIndex
```

Selectors always `s => s.specificField` — never whole store.

---

## CRITICAL BUGS TO NEVER REINTRODUCE

1. Drei `<Html>` without portal → breaks OrbitControls.
   Fix: `portal={{ current: document.getElementById('html-root') }}`
2. Geometry in render body → lag.
   Fix: `useMemo` every PlaneGeometry / BoxGeometry.
3. AI response not stripped → JSON.parse fail.
   Fix: `raw.replace(/```json\n?|```\n?/g, '').trim()` before parse.
4. `useDesignStore()` full object → re-renders on any change.
   Fix: `useDesignStore(s => s.design)` selector always.
5. dpr > 1.5 → lag on mid-range hardware.
6. SpotLights → GPU limit hit at 8+. Use directional only.

---

## BUILD ORDER (phases)

```
1. globals.css tokens + glass utility
2. Types + Zod schemas
3. Zustand stores (4)
4. Mistral lib + quiz/architect prompts
5. API routes: /api/agent/quiz + /api/agent/design
6. Home page (two mode cards)
7. Quiz UI + useQuizAgent hook
8. CinematicLoader
9. SceneCanvas + lighting
10. RoomMesh (floor+walls+ceiling useMemo)
11. WindowDoorMesh
12. FurnitureFactory + all 13 types
13. HouseModel (maps DesignSpec → RoomMesh array)
14. ControlBar (glass, 5 buttons)
15. Viewer page (cinematic → 3D)
16. ExplodedView (spring + dashed lines + labels)
17. BuilderSidebar (4 categories + type-to-add)
18. BuilderCanvas (drop zone + placed items)
19. Builder page (DnD context + keyboard shortcuts)
20. Polish: token audit, dark mode, perf pass, build clean
```

---

## MUST / NEVER

```
MUST: useMemo all geo | React.memo RoomMesh | dpr[1,1.5] | var(--token) everywhere
MUST: strip fences before JSON.parse | Zod validate before render
MUST: Html portal → html-root div | selector not whole store
NEVER: SpotLights | dpr > 1.5 | hardcoded hex | geometry in render | >8 lights
NEVER: navigate viewer before both API + animation complete
```

---

*Haus Builder · master prompt · /caveman full*
