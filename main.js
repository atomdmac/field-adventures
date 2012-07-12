/*!
 * 
 *   melonJS
 *   http://www.melonjs.org
 *		
 *   Step by step game creation tutorial
 *
 **/

// game resources
var g_resources= [{
	name: "grass-tileset",
	type: "image",
	src: "data/tilesets/grass-tileset.png"
},
{
	name: "test-map",
	type: "tmx",
	src: "data/test-map.tmx"
},
{
	name: "player-sprite",
	type: "image",
	src: "data/sprite/32x32_player.png"
}];


var jsApp = {	
	/* ---
	Initialize the jsApp
	---	*/
	onload: function()
	{
		// Initialize the stage.
		if (!me.video.init('jsapp', 480, 480, false, 1.0))
		{
			alert("Sorry but your browser does not support html 5 canvas.");
			return;
		}
		
		// DEBUG: Render hitboxes.
		me.debug.renderHitBox = true;
		
		// Initialize the "audio"
		me.audio.init("mp3,ogg");
		
		// Set callback for when assets are loaded.
		me.loader.onload = this.loaded.bind(this);
		
		// Preload resources.
		me.loader.preload(g_resources);

		// Load everything & display a loading screen.
		me.state.change(me.state.LOADING);
	},
	
	/* ---
	Callback when everything is loaded
	---	*/
	loaded: function ()
	{
		// Set the "Play/Ingame" Screen Object
		me.state.set(me.state.PLAY, new PlayScreen());
		
		// Add player entity to pool.
		me.entityPool.add("mainPlayer", PlayerEntity);
		
		// Set up keyboard controls.
		me.input.bindKey(me.input.KEY.LEFT, "left");
		me.input.bindKey(me.input.KEY.RIGHT, "right");
		me.input.bindKey(me.input.KEY.UP, "up");
		me.input.bindKey(me.input.KEY.DOWN, "down");
      
      // start the game 
		me.state.change(me.state.PLAY);
	}

}; // jsApp

/* the in game stuff*/
var PlayScreen = me.ScreenObject.extend({
	onResetEvent: function() {	
		// stuff to reset on state change
		me.levelDirector.loadLevel("test-map");
	},
	
	/* ---
	action to perform when game is finished (state change)
	---	*/
	onDestroyEvent: function() {
		// TODO
	}

});

// Borrowed from The Mana World project for a starting point.
var Character = me.ObjectEntity.extend({
    init: function(x, y, settings) {
        // call the parent constructor
        this.parent(x, y, settings);

        // set the walking speed
        this.setVelocity(2.5, 2.5);

        this.setFriction(0.2, 0.2);

        // adjust the bounding box
        this.updateColRect(0,32,0,32);

        // disable gravity
        this.gravity = 0;

        this.firstUpdates = 2;
        this.direction = 'down';
        this.destinationX = x;
        this.destinationY = y;
    },

    update: function() {
        hadSpeed = this.vel.y !== 0 || this.vel.x !== 0;
		
        this.handleInput();
		
        // check & update player movement
        updated = this.updateMovement();
		
        if (this.vel.y === 0 && this.vel.x === 0) {
            if (hadSpeed) {
                updated = true;
            }
        }
		
        // update animation
        if (updated) {
            // update object animation
            this.parent(this);
        }
        return updated;
    },

    handleInput: function() {
        if (this.destinationX < this.pos.x - 10)
        {
            this.vel.x -= this.accel.x * me.timer.tick;
            this.direction = 'left';
        }
        else if (this.destinationX > this.pos.x + 10)
        {
            this.vel.x += this.accel.x * me.timer.tick;
            this.direction = 'right';
        }

        if (this.destinationY < this.pos.y - 10)
        {
            this.vel.y = -this.accel.y * me.timer.tick;
            this.direction = 'up';
        }
        else if (this.destinationY > this.pos.y + 10)
        {
            this.vel.y = this.accel.y * me.timer.tick;
            this.direction = 'down';
        }
    }
})

// Borrowed from The Mana World project for a starting point.
var PlayerEntity = Character.extend({

    init: function(x, y, settings) {
        // call the parent constructor
        this.parent(x, y, settings);

        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
		
    },

    handleInput: function() {
        if (me.input.isKeyPressed('left'))
        {
            this.vel.x -= this.accel.x * me.timer.tick;
            this.direction = 'left';
        }
        else if (me.input.isKeyPressed('right'))
        {
            this.vel.x += this.accel.x * me.timer.tick;
            this.direction = 'right';
        }

        if (me.input.isKeyPressed('up'))
        {
            this.vel.y = -this.accel.y * me.timer.tick;
            this.direction = 'up';
        }
        else if (me.input.isKeyPressed('down'))
        {
            this.vel.y = this.accel.y * me.timer.tick;
            this.direction = 'down';
        }
    }

});

//bootstrap :)
window.onReady(function() {
	jsApp.onload();
});
