// ----------
// Utility
// ----------
Util = {};
Util.timeStamp = function() {
	return window.performance.now();
};
Util.random = function(min, max){
	return min + Math.random() * (max - min);
};
Util.array2D = function(tableau, largeur){
	var result = [];
	for (var i = 0; i < tableau.length; i += largeur) result.push(tableau.slice(i, i + largeur));
	return result;
};
Util.map = function(a,b,c,d,e){
	return(a-b)/(c-b)*(e-d)+d;
};
Util.lerp = function(value1, value2, amount) {
	return value1 + (value2 - value1) * amount;
};
Util.linearTween = function(currentTime, start, degreeOfChange, duration) {
	return degreeOfChange * currentTime / duration + start;
};
Util.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};
Util.easeInOutExpo = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2 * Math.pow( 2, 10 * (t - 1) ) + b;
	t--;
	return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
};

// ----------
// Scene
// ----------
class Scene {
	constructor(name) {
		this.name = name;
		this.loop = true;
		this.init_once = false;
	}
	giveWorld(world){
		this.world = world;
		this.ctx = world.ctx;
	}
	keyEvents(event) {

	}
	init() {

	}
	render() {

	}
	addEntity(){

	}
}
class Entity{
  constructor(scene,x,y){
		this.scene = scene;
		this.world = scene.world;
		this.ctx = this.world.ctx;
		this.body = new Body(this,x,y);
  }
	setSprite(sprite_data){
		this.sprite = new Sprite(this,sprite_data);
	}
	display(){
		if(this.sprite === undefined){
			this.ctx.strokeStyle = "#000";
			this.ctx.strokeRect(this.body.position.x,this.body.position.y,this.body.size.x,this.body.size.y);
		}else{
			this.sprite.display();
		}
  }
	integration(){
			this.body.integration();
  }
}

// class for animated sprites !
class Sprite{
	constructor(entity,sprite_data){
		this.entity = entity;
		this.world = this.entity.world;
		this.tile_size = this.world.tile_size;
		this.ctx = this.world.ctx;
		// image data
		this.image = this.world.assets.image[sprite_data.image].image;
		// sprite
		this.size = sprite_data.size;
		this.current_frame = 0;
		this.animations = {};
		this.current_animation = undefined;
		this.width = this.image.width / this.size.x;
		this.height = this.image.height / this.size.y;
		// timer
		this.tick = 0;
		this.speed = 0.2;
		// offset
		this.offset = {
			x:0,
			y:0,
		}
	}
	addAnimation(name,frames){
		this.animations[name] = frames;
		this.current_animation = name;
	}
	animate(animation_name){
		this.current_animation = animation_name;
		if(this.tick < 1){
			this.tick += this.speed;
		}else{
			this.tick = 0;
			if(this.current_frame < this.animations[animation_name].length -1){
				this.current_frame += 1;
			}else {
				this.current_frame = 0;
			}

		}
	}
	display(){
		this.ctx.drawImage(this.image,
			Math.floor(this.animations[this.current_animation][this.current_frame] % this.width) * this.size.x,
			Math.floor(this.animations[this.current_animation][this.current_frame] / this.width) * this.size.y,
			this.size.x,
			this.size.y,
			this.entity.body.position.x+(this.tile_size/2-this.size.x/2)+this.offset.x,
			this.entity.body.position.y+(this.tile_size/2-this.size.x/2)+this.offset.y,
			this.size.x,
			this.size.y
		);
	}
}

class Body{
  constructor(entity,x,y){
		this.world = entity.world;
		this.step = this.world.FPS.step;
		this.position = new Vector(x,y);
		this.next_position = new Vector(x,y);
		this.velocity = new Vector(0,0);
		this.stepped_velocity = new Vector(0,0);
    this.acceleration = new Vector(0,0);
    this.drag = 0.98;
    this.size = {
      x:16,
      y:16
    };
  }
	setSize(x,y){
		this.size.x = x;
		this.size.y = y;
	}
	updateVelocity(){
		this.velocity.add(this.acceleration);
		this.velocity.mult(this.drag);
		this.stepped_velocity = this.velocity.copy();
		this.stepped_velocity.mult(this.step);
		this.next_position = this.position.copy();
		this.next_position.add(this.stepped_velocity);
		// reset acceleration
		this.acceleration.mult(0);
	}
	updatePosition(){
		this.position.add(this.stepped_velocity);
	}
  integration(){
		this.updateVelocity();
		this.updatePosition();
  }
  applyForce(force_vector){
    this.acceleration.add(force_vector);
  }

}

class Vector{
	constructor(x,y){
		this.x = x || 0;
		this.y = y || 0;
	}
	set(x,y){
		this.x = x;
		this.y = y;
	}
	add(vector){
		this.x += vector.x;
		this.y += vector.y;
	}
	sub(vector){
		this.x -= vector.x;
		this.y -= vector.y;
	}
	mult(scalar){
		this.x *= scalar;
		this.y *= scalar;
	}
	div(scalar){
		this.x /= scalar;
		this.y /= scalar;
	}
	limit(limit_value){
		if(this.mag() > limit_value) this.setMag(limit_value);
	}
	mag(){
		return Math.hypot(this.x,this.y);
	}
	setMag(new_mag){
		if(this.mag() > 0){
			this.normalize();
		}else{
			this.x = 1;
			this.y = 0;
		}
		this.mult(new_mag);
	}
	dist(vector){
		return new Vector(this.x - vector.x,this.y - vector.y).mag();
	}
	normalize(){
		let mag = this.mag();
		if(mag > 0){
			this.x /= mag;
			this.y /= mag;
		}
	}
	heading(){
		return Math.atan2(this.x,this.y);
	}
	setHeading(angle){
		let mag = this.mag();
		this.x = Math.cos(angle) * mag;
		this.y = Math.sin(angle) * mag;
	}
	copy(){
		return new Vector(this.x,this.y);
	}
}

class Box{
	constructor(world,box_data){
		this.world = world;
		this.ctx = world.ctx;
		this.c_ctx = world.c_ctx;
		this.box_data = box_data;
		this.resolution = box_data.resolution;
		this.image = world.assets.image[box_data.image].image;
	}
	display(x,y,width,height){
		// background
		this.ctx.fillRect(x+1,y+1,width-2,height-2);
		// corners
		this.ctx.lineWidth = 2;
		let coners = [0,2,6,8];
		for (let i = 0; i < 4; i++) {
			let pos_x = x + Math.floor(i%2) * (width - this.resolution),
					pos_y = y + Math.floor(i/2) * (height - this.resolution);
			let clip_x = Math.floor(i%2) * (this.resolution*2),
					clip_y = Math.floor(i/2) * (this.resolution*2);
			this.ctx.drawImage(this.image,
			clip_x,clip_y,
			this.resolution,this.resolution,
			pos_x,pos_y,
			this.resolution,this.resolution);
		}
		let offset = this.resolution*3;
		// top
		this.ctx.drawImage(this.image,
		8,0,
		this.resolution,this.resolution,
		x+8,y,
		this.resolution+width-offset,this.resolution);
		// bottom
		this.ctx.drawImage(this.image,
		8,16,
		this.resolution,this.resolution,
		x+8,y+height-this.resolution,
		this.resolution+width-offset,this.resolution);
		// left
		this.ctx.drawImage(this.image,
		0,8,
		this.resolution,this.resolution,
		x,y+8,
		this.resolution,this.resolution+height-offset);
		// right
		this.ctx.drawImage(this.image,
		16,8,
		this.resolution,this.resolution,
		x+width-this.resolution,y+this.resolution,
		this.resolution,this.resolution+height-offset);

	}
}



// ----------
// Diorama.js
// ----------
class Diorama {
	constructor( parameters ) {
		this.parameters = parameters;
		// Game and author's name
		this.game_info = {
			name: parameters.name || "Untitled",
			author: parameters.author || "Anonymous",
		};
		// canvas
		this.background_color = parameters.background_color || "#000";
		this.initCanvas( parameters );
		// Assets
		this.counter = 0;
		this.toLoad = parameters.assets.length;
		this.assets = {
			image: {},
			audio: {},
		};
		this.audio_muted = false;
		// keyboard event
		this.keys = {};
		// Scenes
		this.scenes = {};
		this.start_screen = parameters.start_screen || undefined;
		this.current_scene = "";
		// Bitmap font Data
		this.alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ?!:',.()<>[]";
		this.fonts = {};
		// Maps
		this.tile_size = parameters.tile_size || 16;
		this.tiles_data = {};
		if(parameters.tiles !== undefined){
			parameters.tiles.map(tile =>{
				this.tiles_data[tile.id] = tile;
			});
		}
		this.mapsMax = parameters.maps.length;
		this.maps = {};
		if(parameters.maps !== undefined){
		parameters.maps.map(map =>{
			this.maps[map.name] = map;
		});
	}
		// Box system
		this.boxes = {};
		// By default the current font is the first font you create
		this.currentFont = undefined;
		// Game loop Data
		this.FPS = {
			now: 0,
			delta: 0,
			last: Util.timeStamp(),
			step: 1 / ( parameters.frame_rate || 60 ),
		};
		this.requestChange = {
			value: false,
			action: ""
		};
		this.main_loop = undefined;
		this.setScale();
	}
	// ---
	// Setup & Loading
	// ---
	ready() {
		this.loadAssets( this.parameters.assets );
	}
	initCanvas( parameters ) {
		this.canvas = document.createElement( "canvas" );
		this.ctx = this.canvas.getContext( '2d' );
		this.W = this.canvas.width = parameters.width || 256;
		this.H = this.canvas.height = parameters.height || 256;
		this.scale = parameters.scale || 1;
		this.full = false;
		this.ctx.imageSmoothingEnabled = false;
		this.canvas.classList.add("crisp");
		document.body.appendChild( this.canvas );
		// cache canvas
		this.cache = document.createElement( "canvas" );
		this.c_ctx = this.cache.getContext( "2d" );
	}
	loader() {
		// increment loader
		this.clear("#222");
		this.counter += 1;
		let padding = 20;
		let width = this.W - padding * 2,
			x = padding,
			y = this.H - padding * 2;
		this.ctx.fillStyle = "#111";
		this.ctx.fillRect( x, y, width, 20 );
		this.ctx.fillStyle = "#333";
		this.ctx.fillRect( x, y, ( this.counter * width / this.toLoad ), 20 );
		this.ctx.strokeStyle = "#000";
		this.ctx.lineWidth = 4;
		this.ctx.strokeRect( x, y, width, 20 );
		if ( this.counter === this.toLoad ) {
			this.launch();
		}
	}
	loadAssets( assets ) {
		if ( assets === undefined ) console.log( "Nothing to load" );
		assets.map( obj => this.checkAssets( obj ) );
	}
	checkAssets( obj ) {
		let subject = obj;
		switch ( obj.type ) {
			case "img":
				let img = new Image();
				img.onload = () => {
					this.loader();
				};
				img.onerror = () => {
					console.log( "can't load Image: " + obj.name );
				};
				img.src = obj.path;
				subject.image = img;
				this.assets.image[ obj.name ] = subject;
				break;
			case "audio":
				let audio = new Audio( obj.path );
				audio.addEventListener( 'canplaythrough', this.loader() );
				audio.onerror = () => {
					console.log( "can't load audio: " + obj.name );
				};
				subject.audio = audio;
				this.assets.audio[ obj.name ] = subject;
				break;
			case undefined:
				console.log( obj.name, " doesn't have any type" );
				break;
			default:
				console.log( obj.name, " has a none known type" );
		}
	}
	launch() {
		this.eventSetup();
		this.initBoxes( this.parameters.boxes );
		this.initFonts( this.parameters.fonts );
		this.startScene( this.start_screen );
	}
	initBoxes( boxes_data ) {
		if ( boxes_data === undefined) return false;
		boxes_data.map( box => {
			this.boxes[box.name] = new Box(this,box);
		});
	}
	drawBox( box_name , x , y , width , height){
		this.boxes[box_name].display(x,y,width,height);
	}
	// ---
	// Font manager
	// ---
	setFont( font_name ) {
		this.currentFont = font_name;
	}
	initFonts( fonts_data ) {
		if ( fonts_data === undefined && fonts_data.length > 0 ) return false;
		fonts_data.map( font => {
			if ( this.assets.image[ font.image ] === undefined ) {
				console.log( "can't load font, " + font.image + " doesn't exist" );
				return false
			};
			font.image = this.assets.image[ font.image ].image;
			this.fonts[ font.name ] = font;
		} );
		// set current font to the first font !
		this.currentFont = Object.keys( this.fonts )[ 0 ];
	}
	write( text, x, y, justify, colorID ) {
		if ( this.currentFont === undefined ) {
			console.log( "No bitmap_font" );
			return false;
		}
		if ( typeof( justify ) === "string" ) {
			switch ( justify ) {
				case "center":
					x -= ( text.length * this.fonts[ this.currentFont ].size.x ) / 2;
					break;
				case "right":
					x -= ( text.length * this.fonts[ this.currentFont ].size.x );
					break;
				default:
			}
			this.writeLine( text, x, y, colorID || 0 );
		} else {
			this.writeParagraph(text, x, y, justify, colorID || 0)
		}
	}
	writeParagraph(text, x, y, justify, colorID) {
		let y_offset = 0,
				line_height = this.fonts[ this.currentFont ].size.y + 5,
				size_x = this.fonts[ this.currentFont ].size.x,
				words = text.split(' '),
				line = "";
		for (let i = 0; i < words.length; i++) {
			line += words[i] + " ";
			let nextword_width = 0,
				next_word = words[i + 1],
				line_length = line.length * size_x;
			(next_word) ? nextword_width = next_word.length * size_x: 0;
			if (line_length + nextword_width > justify) {
				this.writeLine(line, x, y + y_offset, colorID);
				y_offset += line_height;
				line = "";
			} else {
				this.writeLine(line, x, y + y_offset, colorID);
			}
		}
	}
	writeLine( text, x, y, colorID ) {
		// write line
		let size_x = this.fonts[ this.currentFont ].size.x,
			size_y = this.fonts[ this.currentFont ].size.y,
			font_img = this.fonts[ this.currentFont ].image;
		for ( let i = 0; i < text.length; i++ ) {
			let index = this.alphabet.indexOf( text.charAt( i ) ),
				clipX = size_x * index,
				posX = x + ( i * size_x );
			this.ctx.drawImage( font_img, clipX, ( colorID * size_y ), size_x, size_y, posX, y, size_x, size_y );
		}
	}
	// -----------------
	// Events
	// -----------------
	eventSetup() {
			document.addEventListener("keydown", event => this.keyDown(event), false);
			document.addEventListener("keyup", event => this.keyUp(event), false);
	}
	keyDown(event) {
    event.preventDefault();
		this.keys[event.key.toLowerCase()] = true;
		if (this.keys.KeyF) {
			this.fullScreen();
		}
		if (this.keys.KeyM) {
			this.mute();
		}
		this.current_scene.keyEvents(event);
	}
	keyUp(event) {
		this.keys[event.key.toLowerCase()] = false;
	}
	// ---
	// Scene Manager
	// ---
	startScene( scene_name ) {
		// check if the scene exist
		if ( this.scenes[ scene_name ] === undefined ) return scene_name + " - doesn't exist";
		// request the change of scene if this.main_loop is active
		if ( this.main_loop !== undefined ) {
			this.requestChange.value = true;
			this.requestChange.action = scene_name;
			return false;
		}
		this.requestChange.value = false;
		this.requestChange.action = "";
		this.FPS.last = Util.timeStamp();
		this.current_scene = this.scenes[ scene_name ];
		this.initScene();
		// does this scenes needs a gameloop ?
		if ( this.current_scene.loop === true ) {
			this.gameLoop();
		} else {
			this.mainRender();
		}
	}
	initScene() {
		if ( this.current_scene.init_once ) return false;
		this.current_scene.init();
	}
	addScene( scene ) {
		// links this world to this scene
		scene.giveWorld( this );
		this.scenes[ scene.name ] = scene;
	}
	// ---
	// Main Loop
	// ---
	mainRender() {
		this.clear();
		this.current_scene.render();
	}
	loopCheck() {
		if ( this.requestChange.value === false ) {
			this.main_loop = requestAnimationFrame( () => this.gameLoop() );
		} else {
			cancelAnimationFrame( this.main_loop );
			this.main_loop = undefined;
			this.startScene( this.requestChange.action );
		}
	}
	gameLoop() {
		this.FPS.now = Util.timeStamp();
		this.FPS.delta += Math.min( 1, ( this.FPS.now - this.FPS.last ) / 1000 )
		while ( this.FPS.delta > this.FPS.step ) {
			this.FPS.delta -= this.FPS.step;
			this.mainRender();
		}
		this.FPS.last = this.FPS.now;
		this.loopCheck();
	}
	// Basic functions
	soundLevel(volume){
		for (let [k, v] of Object.entries(this.assets.audio)) {
			v.audio.volume = volume;
		}

	}
	mute() {
		this.audio_muted = !this.audio_muted;
		for (let [k, v] of Object.entries(this.assets.audio)) {
			v.audio.muted = this.audio_muted;
		}
	}
	clear(custom_color) {
		this.ctx.fillStyle = custom_color || this.background_color;
		this.ctx.fillRect( 0, 0, this.W, this.H );
	}
	setScale() {
		this.canvas.style.maxWidth = this.W * this.scale + "px";
		this.canvas.style.maxHeight = this.H * this.scale + "px";
		this.canvas.style.width = "100%";
		this.canvas.style.height ="100%";
	}
	fullScreen() {
		this.full = !this.full;
		if (!this.full) {
			this.setScale();
		} else {
			// reset
			this.canvas.style.maxWidth = "";
			this.canvas.style.maxHeight = "";
			this.canvas.style.width = "";
			this.canvas.style.height = "";

			// set full screen
			this.canvas.style.width = "100%";
			this.canvas.style.height = "100%";
		}
	}
	// ---
	// Tile map
	// ---
	getTile(layer_id,x,y){
		if(x < 0 || x > this.terrain.layers[layer_id].size.x-1) return false;
		if(y < 0 || y > this.terrain.layers[layer_id].size.y-1) return false;
		let tile = this.tiles_data[this.terrain.layers[layer_id].geometry[y][x]];
		if(tile === undefined) return false;
		return tile;
	}
	findTile(layer_id,tile_id){
		let layer = this.terrain.layers[layer_id];
		let result = [];
		for (let y = 0; y < layer.size.y; y++) {
			for (let x = 0; x < layer.size.x; x++) {
				let id = layer.geometry[y][x];
				if(id === tile_id){
					result.push({x:x,y:y});
				}
			}}
			return result;
	}
	initMap(map_name){

		this.terrain = JSON.parse(JSON.stringify(this.maps[map_name]));
		// give size to layers
		for (var i = 0; i < this.terrain.layers.length; i++) {
			this.terrain.layers[i].size = {
				x:this.terrain.layers[i].geometry[0].length,
				y:this.terrain.layers[i].geometry.length,
			}
		}
		this.terrain.tileset = this.assets.image[this.maps[map_name].tileset].image;
		this.terrain.tileset_size = {
			width: (this.terrain.tileset.width / this.tile_size),
			height: (this.terrain.tileset.height / this.tile_size) + 1,
		};
		this.terrain.layers.forEach((layer,index) =>{
			this.marchingSquare(layer);
			this.bitMasking(layer);

			// create a cache for reducing draw call in the gameLoop
			this.terrainCache(layer);
			// prepare animated tiles
			layer.animated = [];
			for (var id in this.tiles_data) {
				if (this.tiles_data[id].animated === true) {
					let tiles = this.findTile(index,parseInt(id));
					layer.animated.push({
						id:id,
						spritesheet:this.assets.image[this.tiles_data[id].spritesheet].image,
						positions:tiles,
						current:0,
						steps:this.tiles_data[id].steps,
						max_frame:this.assets.image[this.tiles_data[id].spritesheet].image.width/this.tile_size,
					});
				}
			}
		});
		this.clear("black");
	}
	terrainCache(layer){
		layer.cache = {};
		let c = layer.cache.c = document.createElement("canvas");
		let ctx = layer.cache.ctx = layer.cache.c.getContext('2d');
		let W = c.width = layer.size.x * this.tile_size,
				H = c.height = layer.size.y * this.tile_size;
		// Draw on cache
		this.ctx.clearRect(0,0,W,H);
		this.drawLayer(layer);
		ctx.drawImage(this.canvas,0,0);
		this.clear();
	}
	marchingSquare(layer){
		layer.square = [];
		for (let y = 0; y < layer.size.y; y++) {
			for (let x = 0; x < layer.size.x; x++){
			let p1=0,p2=0,p3=0,p4=0;

				if (y+1 < layer.size.y && x+1 < layer.size.x) {
							p1 = layer.geometry[y][x];
							p2 = layer.geometry[y][x + 1];
							p3 = layer.geometry[y + 1][x + 1];
							p4 = layer.geometry[y + 1][x];
				}
				let id = (p1 * 8) + (p2*4) + (p3*2 ) + p4;
				layer.square.push(id);
			}
		}

		layer.square = Util.array2D(layer.square, layer.size.x);
	}
	bitMasking(layer) {
		layer.bitMask = [];
		for (let y = 0; y < layer.size.y; y++) {
			for (let x = 0; x < layer.size.x; x++) {
				let id = layer.geometry[y][x];
				let neighbor = [0, 0, 0, 0];
				if (y - 1 > -1) {
					if (id === layer.geometry[y - 1][x]) {
						//top
						neighbor[0] = 1;
					}
				}else {
					neighbor[0] = 1;
				}
				if (x - 1 > -1) {
				if (id === layer.geometry[y][x - 1]) {
					// left
					neighbor[1] = 1;
				}
				}else {
					neighbor[1] = 1;
				}
				if (x + 1 < layer.size.x) {
				if (id === layer.geometry[y][x + 1]) {
					// right
					neighbor[2] = 1;
				}
			}else {
				neighbor[2] = 1;
			}

				if (y + 1 < layer.size.y) {
					if (id === layer.geometry[y + 1][x]) {
						//down
						neighbor[3] = 1;
					}
				}else{
					neighbor[3] = 1;
				}
				id = 1 * neighbor[0] + 2 * neighbor[1] + 4 * neighbor[2] + 8 * neighbor[3];
				layer.bitMask.push(id);
			}
		}
		layer.bitMask = Util.array2D(layer.bitMask, layer.size.x);

	}
	renderMap(){
		this.terrain.layers.forEach(layer =>{
			this.ctx.drawImage(layer.cache.c,0,0);
			// draw animated layer
			layer.animated.forEach(tile=>{
				if (tile.current < tile.max_frame-1) {
					tile.current += tile.steps;
				}else {
					tile.current = 0;
				}
				// render animated tiles
				tile.positions.forEach(position=>{
					let x = position.x * this.tile_size,
							y = position.y * this.tile_size;
					this.ctx.drawImage(tile.spritesheet,
						Math.floor(tile.current)*this.tile_size,
						0,
						this.tile_size,
						this.tile_size,
						x,
						y,
						this.tile_size,
						this.tile_size
				)
				});
			});
		});
	}
	drawMap(){
		this.terrain.layers.forEach(layer =>{
			this.drawLayer(layer);
		});

	}
	drawLayer(layer){
		for (let y = 0; y < layer.size.y; y++) {
			for (let x = 0; x < layer.size.x; x++) {
				// ID of the tile
				let id = layer.geometry[y][x];
				// Don't draw invisible tiles
				// Position of the tile :)
				let positionX = (x * this.tile_size) + layer.offset.x,
						positionY = (y * this.tile_size) + layer.offset.y;
				let sourceX = Math.floor(id % this.terrain.tileset_size.width) * this.tile_size,
						sourceY = Math.floor(id / this.terrain.tileset_size.width) * this.tile_size;
				if(this.tiles_data[id] && this.tiles_data[id].visibility === false){
					continue;
				}
				if (this.tiles_data[id] && this.tiles_data[id].look === "bitmask") {
					sourceX = Math.floor(layer.bitMask[y][x]) * this.tile_size;
					sourceY = this.tiles_data[id].line * this.tile_size;
				}

				if(layer.look === "square"){
					if(layer.square[y][x] === 0) continue;
					positionX+= this.tile_size/2;
					positionY+= this.tile_size/2;
				  sourceX = Math.floor(layer.square[y][x] % 16) * 16;
					sourceY =   (7*this.tile_size);
				}


				if(this.tiles_data[id] && this.tiles_data[id].animated === true){
					// hide animated sprites on the cache
					continue;
				}

				// render tile

				this.ctx.drawImage(this.terrain.tileset, sourceX, sourceY, this.tile_size, this.tile_size, positionX, positionY, this.tile_size, this.tile_size);


			}
		}
	}
}


let parameters = {
  name: "Title",
  start_screen: "inGame",
  background_color: "white",
  width: 192,
  height: 128,
  scale: 3,
  assets: [
    // Images
    {
      type: "img",
      name: "coderscrux_font",
      path: "https://image.ibb.co/jOtcse/coderscrux_font.png"
    },
    {
      type: "img",
      name: "nano_font",
      path: "https://image.ibb.co/fXA1JK/nano_font.png"
    },
    {
      type: "img",
      name: "box_texture",
      path: "https://image.ibb.co/hhgK5z/box.png"
    },
    {
      type: "img",
      name: "bonhomme_1",
      path: "https://image.ibb.co/mWyoyK/bonhomme_1.png"
    },
    {
      type: "img",
      name: "bonhomme_2",
      path: "https://image.ibb.co/m9aCQz/bonhomme_2.png"
    },
    {
      type: "img",
      name: "bonhomme_3",
      path: "https://image.ibb.co/dCpiXe/bonhomme_3.png"
    },
    {
      type: "img",
      name: "background",
      path: "https://image.ibb.co/nGUHse/background.png"
    },
    {
      type: "img",
      name: "button_key",
      path: "https://image.ibb.co/iVU6kz/button_key.png"
    },
    {
      type: "img",
      name: "main_title",
      path: "https://image.ibb.co/epYcse/main_title.png"
    },
    {
      type: "img",
      name: "shadow",
      path: "https://image.ibb.co/kxqe5z/shadow.png"
    },
    {
      type: "img",
      name: "rabbit",
      path: "https://image.ibb.co/ij7gJK/rabbit.png"
    },
    {
      type: "img",
      name: "cloud_1",
      path: "https://image.ibb.co/nbRVCe/cloud_1.png"
    },
    {
      type: "img",
      name: "cloud_2",
      path: "https://image.ibb.co/nGocse/cloud_2.png"
    }

    // Bitmap font
  ],
  fonts: [
    // basic font
    {
      name: "coder",
      image: "coderscrux_font",
      size: { x: 6, y: 9 }
    },
    {
      name: "nano",
      image: "nano_font",
      size: { x: 4, y: 6 }
    }
  ],
  // box system
  boxes: [
    {
      name: "box",
      resolution: 8,
      image: "box_texture"
    }
  ],

  maps: []
};

// inGame scene
function randomUnique(length, size) {
  if (length < size) return false;
  let result = [];
  while (result.length < size) {
    let ID = Math.floor(Util.random(0, length));
    let test = result.every(value => {
      return value !== ID;
    });
    if (test) {
      result.push(ID);
    }
  }
  return result;
}
let sprites = [
  {
    image: "bonhomme_1",
    size: {
      x: 16,
      y: 20
    },
    run: [0, 1, 2, 3, 4, 5, 6, 7]
  },
  {
    image: "bonhomme_2",
    size: {
      x: 16,
      y: 20
    },
    run: [0, 1, 2, 3, 4, 5, 6, 7]
  },
  {
    image: "bonhomme_3",
    size: {
      x: 16,
      y: 20
    },
    run: [0, 1, 2, 3, 4, 5, 6, 7]
  }
];
let inGame = new Scene("inGame");
inGame.init = function() {
  this.ctx = this.world.ctx;
  this.players = [];
  // add players in the scene :)
  let IDS = randomUnique(sprites.length, 2);
  let keySet_1 = {
    set: ["a", "z", "q", "s", "e", "d", "r", "f"],
    x: this.world.W / 4
  };
  let keySet_2 = {
    set: ["p", "o", "m", "l", "i", "u", "k", "j"],
    x: this.world.W / 2 + this.world.W / 4
  };
  let P_1 = new Runner(this, 28, 64, IDS[0], keySet_1),
    P_2 = new Runner(this, 20, 72, IDS[1], keySet_2);
  this.players.push(P_1, P_2);
  // GLOBAL VARIABLES
  this.title_phase = 0;
  this.title_out = false;
  this.title_pos = {
    start: 10,
    actual: 10,
    target: -50
  };
  //
  this.count_down_text = ["Ready...", "steady...", "go !"];
  this.count_down_current = 0;
  // states !
  this.STATE = "menu";
  this.winner = 0;
  //
  this.trans = [];

  // transition effects
  this.transition = {
    scene: this,
    active: true,
    // between 0 and 100
    state: 0,
    value: 0,
    duration: 500,
    start: 0,
    // between whatever and whatever
    from: 0,
    to: Math.max(this.world.W, this.world.H),
    //
    start: function(from, to, callback) {
      this.active = true;
      this.from = from;
      this.start_time = new Date();
      this.to = to;
      this.callback = callback;
    },
    update: function() {
      let time = new Date() - this.start_time;
      if (time < this.duration) {
        this.value = Util.easeInOutQuad(
          time,
          this.from,
          this.to - this.from,
          this.duration
        );
      } else {
        this.active = false;
        if (this.callback !== undefined) {
          this.callback();
        }
      }
    },
    render: function() {
      this.scene.ctx.fillStyle = "black";
      this.scene.ctx.fillRect(0, 0, this.scene.world.W, this.value);
      this.scene.ctx.fillRect(
        0,
        this.scene.world.H,
        this.scene.world.W,
        -this.value
      );
      this.scene.ctx.fillRect(0, 0, this.value, this.scene.world.H);
      this.scene.ctx.fillRect(
        this.scene.world.W,
        0,
        -this.value,
        this.scene.world.H
      );
    }
  };
  this.transition.start(Math.max(this.world.W / 2, this.world.H / 2), 0);
  // roger the rabbit :)
  this.roger = new Rabbit(this, this.world.W - 40, this.world.H - 20);
  this.clouds = [];

  this.clouds.push(new Cloud(this, 0, 0));
  this.clouds.push(new Cloud(this, 0, 0));
  this.clouds.push(new Cloud(this, 0, 0));
  this.clouds.push(new Cloud(this, 0, 0));
};
inGame.render = function() {
  // draw background
  this.renderScenery();
  // render clouds
  this.renderClouds();
  // players
  this.renderPlayer();
  // render roger
  this.roger.render();
  // ui
  this.title_screen();
  this.countDown();
  this.renderWin();
  // trans
  for (let i = this.trans.length; i--; ) {
    this.trans[i].update();
  }

  if (this.transition.active) {
    this.transition.update();
    this.transition.render();
  }
};
inGame.renderClouds = function() {
  this.clouds.forEach(cloud => {
    cloud.render();
  });
};
inGame.renderPlayer = function() {
  this.players.forEach(player => {
    // update player
    if (this.STATE === "running") {
      player.checkKeys();
      player.update();
      player.checkWin();
    }
    // draw keys
    if (this.STATE === "running") {
      player.drawKeys();
    }
    // draw player
    player.draw();
  });
};
inGame.title_screen = function() {
  // title state
  if (this.STATE !== "menu") return false;
  this.title_phase += 0.04;
  let y = Math.sin(this.title_phase) * 4;
  let title_image = this.world.assets.image.main_title.image;
  this.world.ctx.drawImage(
    title_image,
    this.world.W / 2 - title_image.width / 2,
    y + this.title_pos.actual
  );
  this.world.setFont("nano");
  this.world.write(
    "Press space when ready !",
    this.world.W / 2,
    this.world.H - 23,
    "center"
  );
  if (this.world.keys[" "] && !this.title_out) {
    this.title_out = true;
    let callback = () => {
      this.STATE = "count_down";
      setTimeout(() => {
        this.count_down_current = 1;
        setTimeout(() => {
          this.count_down_current = 2;
          setTimeout(() => {
            this.STATE = "running";
          }, 1000);
        }, 1000);
      }, 1000);
    };
    let t = new transition(this, callback);
    t.update = function() {
      let time = new Date() - this.start;
      let duration = 1000;
      if (time < duration) {
        this.scene.title_pos.actual = Util.easeInOutExpo(
          time,
          this.scene.title_pos.start,
          this.scene.title_pos.target - this.scene.title_pos.start,
          duration
        );
      } else {
        this.end();
      }
    };
    this.trans.push(t);
  }
};
inGame.countDown = function() {
  if (this.STATE !== "count_down") return false;
  this.world.setFont("nano");
  this.world.write(
    this.count_down_text[this.count_down_current].toString(),
    this.world.W / 2,
    this.world.H - 20,
    "center"
  );
};
inGame.renderWin = function() {
  if (this.STATE !== "win") return false;
  this.world.setFont("nano");
  this.world.write(
    "player " + (this.winner + 1).toString() + " won the race !",
    this.world.W / 2,
    20,
    "center"
  );
  this.world.write(
    "Space to restart !",
    this.world.W / 2,
    this.world.H - 20,
    "center"
  );
  if (this.world.keys[" "] && !this.transition.active) {
    this.restart();
  }
};

inGame.restart = function() {
  this.transition.start(0, Math.max(this.world.W / 2, this.world.H / 2), () => {
    this.world.startScene("inGame");
  });
};
inGame.renderScenery = function() {
  this.ctx.drawImage(game.assets.image.background.image, 0, 0);
};
// init sprites
class Runner extends Entity {
  constructor(scene, x, y, sprite_id, keySet) {
    super(scene, x, y);
    this.setSprite(sprites[sprite_id]);
    this.sprite.addAnimation("run", sprites[sprite_id].run);
    this.keySet = keySet;
    this.next_key;
    this.last_key;
    this.getNextKey();
    this.keyPressed = false;
    this.start = x;
  }
  getNextKey() {
    this.next_key = this.keySet.set[
      Math.floor(Util.random(0, this.keySet.set.length))
    ];
  }
  checkKeys() {
    if (this.world.keys[this.next_key] && !this.keyPressed) {
      this.last_key = this.next_key;
      this.keyPressed = true;
      let force = new Vector(10, 0);
      this.body.applyForce(force);
    }
    if (this.keyPressed && !this.world.keys[this.last_key]) {
      this.getNextKey();
      this.keyPressed = false;
    }
  }
  drawKeys() {
    // draw key
    this.world.setFont("coder");
    let key_image = this.world.assets.image.button_key.image;
    this.world.ctx.drawImage(
      key_image,
      this.keyPressed * 19,
      0,
      19,
      20,
      this.keySet.x - 7,
      16,
      19,
      20
    );
    this.world.write(
      this.next_key.toUpperCase().toString(),
      this.keySet.x,
      20 + this.keyPressed * 3
    );
  }
  checkWin() {
    if (this.body.position.x - this.start > 130) {
      this.scene.STATE = "win";
      this.scene.winner = this.scene.players.indexOf(this);
    }
  }
  draw() {
    let shadow = this.world.assets.image.shadow.image;
    this.world.ctx.drawImage(
      shadow,
      this.body.position.x + 3,
      this.body.position.y + 18
    );
    this.sprite.animate("run");
    this.display();
  }
  update() {
    this.sprite.speed = Util.map(
      this.body.stepped_velocity.mag(),
      0,
      0.2,
      0,
      0.1
    );
    this.body.integration();
  }
}
class transition {
  constructor(scene, callback) {
    this.scene = scene;
    this.world = scene.world;
    this.callback = callback;
    this.start = new Date();
  }
  update() {}
  end() {
    this.callback();
    this.scene.trans.splice(this.scene.trans.indexOf(this), 1);
  }
}

class Rabbit extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y);
    let sprite = {
      image: "rabbit",
      size: {
        x: 20,
        y: 20
      }
    };

    this.setSprite(sprite);
    this.sprite.speed = 0.3;
    this.sprite.addAnimation("run_left", [0, 1, 2, 3, 4, 5]);
    this.sprite.addAnimation("run_right", [6, 7, 8, 9, 10, 11]);
    this.body.position = new Vector(
      Util.random(20, this.world.W - 20),
      Util.random(this.world.H / 1.5, this.world.H - 20)
    );
    this.init_trans();
  }
  init_trans() {
    this.start = new Date();
    this.from = this.body.position.copy();
    this.target = new Vector(
      Util.random(20, this.world.W - 20),
      Util.random(this.world.H / 1.5, this.world.H - 20)
    );
    this.duration = this.target.dist(this.body.position) / 0.04;
    this.inTransition = true;
  }
  update() {
    if (!this.inTransition) return false;
    let time = new Date() - this.start;
    if (time < this.duration) {
      if (this.target.x > this.from.x) {
        this.sprite.animate("run_right");
      } else {
        this.sprite.animate("run_left");
      }

      this.body.position.x = Util.linearTween(
        time,
        this.from.x,
        this.target.x - this.from.x,
        this.duration
      );
      this.body.position.y = Util.linearTween(
        time,
        this.from.y,
        this.target.y - this.from.y,
        this.duration
      );
    } else {
      this.inTransition = false;
      this.sprite.current_frame = 2;
      setTimeout(() => {
        this.init_trans();
      }, Util.random(500, 10000));
    }
  }
  draw() {
    this.display();
  }
  render() {
    this.update();
    this.draw();
  }
}

class Cloud extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.init_trans();

    this.body.position = new Vector(
      Util.random(0, this.world.W + 200),
      Util.random(-10, 36)
    );
    this.from = this.body.position.copy();
    this.target = this.body.position.copy();
    this.target.x = -this.sprite.width * 2;
  }

  init_trans() {
    this.body.position = new Vector(this.world.W, Util.random(-10, 36));

    let id = Math.floor(Util.random(0, 2)) + 1;

    this.sprite = this.world.assets.image["cloud_" + id].image;
    this.start = new Date();
    this.from = this.body.position.copy();
    this.target = this.body.position.copy();
    this.target.x = -this.sprite.width * 2;

    this.duration =
      this.target.dist(this.body.position) / Util.random(0.01, 0.02);
    this.inTransition = true;
  }

  update() {
    if (!this.inTransition) return false;
    let time = new Date() - this.start;
    if (time < this.duration) {
      this.body.position.x = Util.linearTween(
        time,
        this.from.x,
        this.target.x - this.from.x,
        this.duration
      );
      this.body.position.y = Util.linearTween(
        time,
        this.from.y,
        this.target.y - this.from.y,
        this.duration
      );
    } else {
      this.inTransition = false;
      setTimeout(() => {
        this.init_trans();
      }, Util.random(2, 10000));
    }
  }
  draw() {
    this.world.ctx.drawImage(
      this.sprite,
      this.body.position.x,
      this.body.position.y
    );
  }
  render() {
    this.update();
    this.draw();
  }
}

let game = new Diorama(parameters);
// Add the different scenes here
// the addScene function link the scene with the world (game)
game.addScene(inGame);
game.ready();
// everything start being loaded now !
// the ready function must be called last !