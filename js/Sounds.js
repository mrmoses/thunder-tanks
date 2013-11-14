var tt = (function(tt) {

    var sounds = {};

    tt.playSound = function(soundId){
      // start playing
      soundManager.play(soundId);
    };

    // initialize SoundManager
    (function() {
        // when soundManager is ready, initialze sounds
        soundManager.setup({
          url: 'js/lib/soundmanagerv297a-20130512/swf/',
          flashVersion: 9, // optional: shiny features (default = 8)
          preferFlash: false,
          onready: function() {
            sounds.drummerTheme = soundManager.createSound('drummerTheme','audio/Civil War Drummer -SoundBible.com-700036269.mp3');
          },
          ontimeout: function() {
            console.log("SM2 could not strat");
          }
        });
    })();

    return tt;
})(tt || {});