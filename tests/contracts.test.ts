import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPlannedDesign } from '../src/lib/layoutPlanner'
import { DesignSpecZ, UserProfileZ } from '../src/lib/schemas'
import { useBuilderStore } from '../src/store/builderStore'

for (const style of ['modernist','scandinavian','japandi'] as const) {
 test(`planned ${style} design satisfies current schema without providers`,()=>{
  const profile=UserProfileZ.parse({spaceType:'house',occupants:{adults:2,children:1},lifestyle:'work-from-home',style,budget:'high'})
  const design=buildPlannedDesign(profile)
  assert.equal(DesignSpecZ.safeParse(design).success,true)
  const rooms=design.floors[0].rooms
  assert.ok(rooms.some(r=>r.type==='office'));assert.ok(rooms.some(r=>r.type==='master-bedroom'))
  assert.ok(rooms.every(r=>r.doors.length>0));assert.equal(new Set(rooms.map(r=>r.id)).size,rooms.length)
  assert.equal(design.totalArea,rooms.reduce((sum,r)=>sum+r.dimensions.w*r.dimensions.d,0))
 })
}
test('invalid profile occupants and room dimensions remain rejected',()=>{
 assert.equal(UserProfileZ.safeParse({spaceType:'house',occupants:{adults:0,children:-1},lifestyle:'family',style:'modernist',budget:'low'}).success,false)
 const design=buildPlannedDesign({spaceType:'house',occupants:{adults:1,children:0},lifestyle:'minimalist',style:'modernist',budget:'low'})
 assert.equal(DesignSpecZ.safeParse({...design,floors:[{...design.floors[0],rooms:[{...design.floors[0].rooms[0],dimensions:{w:-1,d:3}}]}]}).success,false)
})
test('builder add, undo, redo and conversion retain UUID room identity',()=>{
 useBuilderStore.getState().reset()
 useBuilderStore.getState().addItem({assetType:'room',assetId:'bedroom',label:'Offline Bedroom',position:{x:0,z:0},rotation:0,scale:1,dimensions:{w:4,d:4,h:2.8}})
 const id=useBuilderStore.getState().items[0].id
 assert.match(id,/^[0-9a-f-]{36}$/)
 assert.equal(useBuilderStore.getState().toDesignSpec().floors[0].rooms[0].id,id)
 useBuilderStore.getState().undo();assert.equal(useBuilderStore.getState().items.length,0)
 useBuilderStore.getState().redo();assert.equal(useBuilderStore.getState().items[0].id,id)
 useBuilderStore.getState().reset()
})
