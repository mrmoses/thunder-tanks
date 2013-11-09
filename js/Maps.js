var TTMaps = {
  Classic: {
    Textures: (function() {
      var textures = [];
      for (var x = 0; x < 10; x++) {
        for (var y = 0; y < 6; y++) {
          textures[textures.length] = {
            img: sandtexture,
            x: x*100,
            y: y*100,
            w: 100,
            h: 100
          };
        }
      }
      return textures;
    })(),
    Blocks: [
      {
        img: bricks,
        x: 192,
        y: 87,
        w: 100,
        h: 100
      },
      {
        img: bricks,
        x: 678,
        y: 87,
        w: 100,
        h: 100
      },
      {
        img: bricks,
        x: 192,
        y: 360,
        w: 100,
        h: 100
      },
      {
        img: bricks,
        x: 678,
        y: 360,
        w: 100,
        h: 100
      }
    ]
  }
}