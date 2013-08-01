JSGameSoup.ready(function() {
    // use the DIV tag with Id of 'surface' as our game surface
    var gs = new JSGameSoup("game", 30);

    // add an instance of the 'Dot' entity class above to our game
    gs.addEntity(new Tank(gs));

    // launch the game
    gs.launch();
});