// src/lib/material-groups.ts
//
// Links two (or more) Printify products that are the SAME design printed on
// different blank shirts, so the site shows one card with a Material
// selector instead of two duplicate-looking cards.
//
// The first entry in `members` is the anchor: its product id/slug is what
// the merged MerchProduct keeps (so existing /merch/{slug} links and cart
// history referencing that product id keep working), and its variants/price
// are what the card shows before anyone touches the Material selector.
//
// To add a new pair: find both Printify product ids, add a group here.
// Nothing else needs to change — getProducts() in printify.ts applies this
// automatically.

export interface MaterialGroupMember {
  productId: string
  material: string   // shown in the UI, e.g. "Heavyweight" / "Classic Cotton"
}

export interface MaterialGroup {
  members: MaterialGroupMember[]
}

export const MATERIAL_GROUPS: MaterialGroup[] = [
  {
    members: [
      { productId: '6a553c87566692467d039225', material: 'Heavyweight' },     // We Make Records Tee (Shaka Wear)
      { productId: '6a849bf854baac230906609c', material: 'Classic Cotton' },  // Gildan We Make Records Tee
    ],
  },
  {
    members: [
      { productId: '6a337c05dcbc8455730f0dc9', material: 'Heavyweight' },     // Time of My Life '87 (Shaka Wear)
      { productId: '6a849d4bfac6f24309057a5d', material: 'Classic Cotton' },  // Gildan Time of My Life '87
    ],
  },
  {
    members: [
      { productId: '6a448d4b837faa324c0d5183', material: 'Heavyweight' },     // Street Beat Drumming Tee (Shaka Wear)
      { productId: '6a84f1e800fdd1b9090da791', material: 'Classic Cotton' },  // Gildan Street Beat Drumming Tee
    ],
  },
  {
    members: [
      { productId: '6a45dbe7b3b24691aa0e14ed', material: 'Heavyweight' },     // Street Beat Pocket Tee (Shaka Wear)
      { productId: '6a84f485bb97b3e319039a2a', material: 'Classic Cotton' },  // Gildan Street Beat Pocket Tee
    ],
  },
]

// productId -> the group it belongs to, built once at module load.
export const PRODUCT_TO_GROUP: Map<string, MaterialGroup> = new Map()
for (const group of MATERIAL_GROUPS) {
  for (const member of group.members) {
    PRODUCT_TO_GROUP.set(member.productId, group)
  }
}
