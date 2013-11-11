/**
 * Map configurations.
 *
 * A map configuration requires:
 *  Textures
 *    [x,y,width,height,image]
 *    Just graphics with no collisions (background).
 *  Blocks
 *    [x,y,width,height,image]
 *    Rectangles that cause collisions.
 *
 *
 * Map dimensions are 970x546
 *
 * Available images:
 *  dirt1: 32x32 of dirt
 *  gret1: 32x32 grey metal type graphic
 *
 */

var TTMaps = {

  /** Classic map of 4 blocks. */
  Classic: {
    Textures: [
      [0,0,970,546,dirt1]
    ],
    Blocks: [
      [192,87,96,96,grey1],
      [678,87,96,96,grey1],
      [192,360,96,96,grey1],
      [678,360,96,96,grey1]
    ],
    Polys: []
  },

  /** 1 centered block. */
  Dirt1: {
    Textures: [
      [0,0,970,546,dirt1]
    ],
    Blocks: [
      [435,223,96,96,grey1]
    ],
    Polys: []
  },

  /** N-like path/shape. */
  BigN: {
    Textures: [
      [0,0,970,546,dirt1]
    ],
    Blocks: [
      [323,194,32,352,grey1],
      [646,0,32,352,grey1]
    ],
    Polys: []
  },

  /** Poly test. */
  PolyTest: {
    Textures: [
      [0,0,970,546,dirt1]
    ],
    Blocks: [],
    Polys: [
      [
        [10,10],
        [100,10],
        [100,100],
        [10,100]
      ],
      [
        [250,150],
        [350,250],
        [250,350],
        [150,250]
      ],
      [
        [600,200],
        [650,200],
        [700,150],
        [750,200],
        [800,200],
        [750,250],
        [800,300],
        [750,300],
        [700,250],
        [650,300],
        [600,300],
        [650,250],
      ]
    ]
  },
}