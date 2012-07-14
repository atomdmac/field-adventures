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
		if (!me.video.init('jsapp', 640, 480, false, 1.0))
		{
			alert("Sorry but your browser does not support html 5 canvas.");
			return;
		}
		
		// DEBUG: Render hitboxes.
		// me.debug.renderHitBox = true;
		
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
		
		me.input.bindKey(me.input.KEY.X, "mouse_move");
		me.input.bindMouse(me.input.mouse.LEFT, me.input.KEY.X);
      
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

var PointMass = me.ObjectEntity.extend({
	init: function(x, y, settings) {
		// TODO
	}
});

// Borrowed from The Mana World project for a starting point.
var Character = me.ObjectEntity.extend({
	
	// Target that the character will move toward when using mouse/pointer
	// movement.
	target: null,
	
    init: function(x, y, settings) {
        // call the parent constructor
        this.parent(x, y, settings);

        // set the walking speed
        this.setVelocity(2.5, 2.5);

        this.setFriction(0.2, 0.2);

        // adjust the bounding box
        this.updateColRect(10,12,16,14);

        // disable gravity
        this.gravity = 0;

        this.firstUpdates = 2;
        this.direction = 'down';
        this.destinationX = x;
        this.destinationY = y;
    },
	
	/**
	 * Returns a vector that points from the origin to the target Vector2d 
	 * object.
	 *
	 * @param origin Start point.
	 * @param target End point.
	 * @param slowdown Should the vector get smaller as we get closer to the target?
	 *
	 */
	_steer: function(origin, target, slowdown) {
		var steer;
		
		// TODO: Make these configurable from higher up.
		maxSpeed = 5,
		maxForce = 5;
		
		var desired = target.clone();
		desired.sub(origin);
		var d = desired.length();
		
		if (d > 0) {
			// Two options for desired vector magnitude (1 -- based on distance, 2 -- maxSpeed)
			if (slowdown && d < 100) {
				desired.length(maxSpeed * (d / 100)); // This damping is somewhat arbitrary
			} else {
				desired.length(maxSpeed);
			}
			steer = desired.clone();
			steer.sub(this.vel);
			steer.length(Math.min(maxForce, steer.length()));
		} else {
			steer = new me.Vector2d(0, 0);
		}
		steer.normalize();
		return steer;
	},
	
	_handlePointerMovement: function() {
		var distance = this.target.clone();
		distance.sub(this.pos);
		
		// Are we there yet?  If not, move toward the target.
		if(distance.length() > 1) {
			
			// Steer!
			var steer = this._steer(this.pos, this.target, false);
			
			// Apply steering vector to velocity.
			this.vel.y = this.accel.y * steer.y
			this.vel.x = this.accel.x * steer.x;
			
			return true;
		} else {
			this.target = null;
			return false;
		}
	},

    update: function() {
        hadSpeed = this.vel.y !== 0 || this.vel.x !== 0;
		
		// Gather current input.
        this.handleInput();
		
		// Use pointer movement (if applicable).
		if(this.target != null) this._handlePointerMovement();
		
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
			
			// Cancel pointer movement.
			this.target = null;
        }
        else if (me.input.isKeyPressed('right'))
        {
            this.vel.x += this.accel.x * me.timer.tick;
            this.direction = 'right';
			
			// Cancel pointer movement.
			this.target = null;
        }

        if (me.input.isKeyPressed('up'))
        {
            this.vel.y = -this.accel.y * me.timer.tick;
            this.direction = 'up';
			
			// Cancel pointer movement.
			this.target = null;
        }
        else if (me.input.isKeyPressed('down'))
        {
            this.vel.y = this.accel.y * me.timer.tick;
            this.direction = 'down';
			
			// Cancel pointer movement.
			this.target = null;
        }
		else if (me.input.isKeyPressed("mouse_move")) {
			// Where are we headed?
			var target = me.input.mouse.pos.clone();
			target.add(me.game.viewport.pos);
			
			// center the sprite.
			var w = this.width / 2;
			var h = this.height / 2;
			target.sub(new me.Vector2d(w,h));
			
			this.target = target;
		}
    }

});

//bootstrap :)
window.onReady(function() {
	jsApp.onload();
});
