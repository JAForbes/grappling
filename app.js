con = can.getContext('2d')

screenSetup = function(){
	can.width = can.width
	con.translate(can.width/2,+can.height/2)
}
draw = function(o){
	con.fillRect(o.x-o.w/2,o.y-o.h/2,o.w,o.h)
}
gravity = function(o){
	var g = 0.005;
	var gMax = 4;
	o.vy = _.min([g+o.vy,gMax])
}
move = function(o){
	o.x += o.vx
	o.y += o.vy
}
face = function(a,b){
	return Math.atan2(b.y - a.y, b.x - a.x);
}
toward = function(a,b){
	var r = face(a,b);
	return {
		x: Math.cos(r) * 3,
		y: Math.sin(r) * 3
	}
}
squared = _.partialRight(Math.pow,2)
distance = function(a,b){
	var sq = squared
	return Math.sqrt(
		sq(b.x-a.x) +
		sq(b.y-a.y)
	)
}
Φ = function(me,you){
	var Δy = you.y - me.y;
	var Δx = you.x - me.x;
	me.r = Math.sqrt(Δy*Δy + Δx*Δx)
	//me.Φ = Math.atan2(Δy,Δx)
	me.Φrad = Math.atan2(Δy,Δx)
	me.Φdeg = me.Φrad * 180 / Math.PI
	var outerLimit = Math.PI //[radians]
	var bPol = 1 //Base Polarity
	if (-Math.PI/2 <= me.Φrad && me.Φrad < Math.PI/2) {
		me.θrad = me.Φrad
		bPol	= -1//basePolarity
	}else{
		if (me.Φrad < 0) {
			outerLimit = outerLimit *-1
		}
		me.θrad = outerLimit - me.Φrad
		
	};

	me.θdeg = me.Φrad * 180 / Math.PI

	me.sinθ = Math.sin(me.θrad)
	me.cosθ = Math.cos(me.θrad)


	me.bPol = bPol
	me.b0 = me.r * me.cosθ * me.bPol
	me.h0 = me.r * me.sinθ *-1
	me.bTest = Math.round(me.x) == Math.round(me.b0)
	me.hTest = Math.round(me.y) == Math.round(me.h0)
	var g = 0.005
	me.wn = gravity * Math.sin(me.θrad)
	var v = Math.sqrt(me.vy*me.vy + me.vx*me.vx)
}

grapplingHook = function(pendulum,anchor,gravity){
	var g = gravity;
	var Δy = anchor.y - pendulum.y;
	var Δx = anchor.x - pendulum.x;
	var r = Math.sqrt(Δy*Δy + Δx*Δx)
	var Φrad = Math.atan2(Δy,Δx)
	var θrad = Φrad
	var outerLimit = Math.PI //[radians]
	var bPol = -1 //Base Polarity
	var radLimit  = Math.PI/2
	//Get θ from Φ and translate computer angle system to mathematical model
		if (-radLimit > Φrad || Φrad >= radLimit) {
			bPol = 1//basePolarity
			if (Φrad < 0) {
				outerLimit = outerLimit *-1
			}
			θrad = outerLimit - Φrad
		}

	var sinθ = Math.sin(θrad)
	var cosθ = Math.cos(θrad)

	//pendulum weight due to gravity projected on axis of pendulum-anchor axis
		var Wr = gravity * Math.sin(θrad)
	//Velocity Magnitude
	var v = Math.sqrt(pendulum.vy*pendulum.vy + pendulum.vx*pendulum.vx)
	var ρ = (v*v/r)	//Radial Acceleration used to compute Tension
	
	//Natural length of pendulum-anchor rod.
		//Hard coded for now.
		//In future set to desired rod length or
		//Set to distance between pendulum and anchor when first connected.
		var r0 = 200
	
	var k = 0.1	//Stiffness of rod

	var E = (r-r0)*k	//Cord elasticity tension component

	var ax = (Wr - ρ - E) * cosθ * bPol
	var ay = (Wr - ρ - E) * sinθ * -1

	pendulum.vy = pendulum.vy+ay
	pendulum.vx = pendulum.vx+ax
	pendulum.r = r
	//pendulum.Φdeg = Φrad * 180 / Math.PI
}

drawState = function(o){
	var i = 0;
	var spacing = 20;
	con.font = '12pt Helvetica'
	for(var key in o){
		var val = o[key]
		con.fillText([key,':',val].join(''),o.x+o.w, o.y + o.h + i * spacing)
		i++
	}
}

reset = function () {
	paused = false
	entities = []
	mouse = {x:0, y:0, w:5, h: 5}
	block = {x:0, y:0, w:10, h:10, vx:0, vy:0, length: 5}
	person = { x:1, y:-200, w:5, h:5, vx:0, vy: 0}
	drawable = [block,person,mouse]
	gravityAffected = [person]
	moveable = [person]
	stateDrawable = [person]
	mousetrackable = [mouse]
	Φable = [mouse]
}



togglePause = function(){
	paused = !paused;
}

window.onkeydown = function(e){
	console.log(e)
	var action = ({
		P: togglePause,
		R: reset
	})[String.fromCharCode(e.keyCode)]
	action && action();
}

;(function(){
  var _m = {x: 0, y: 0}
  window.onclick = function(e){
    _m.x = e.clientX - can.width/2
    _m.y = (e.clientY) - can.height/2
  }

  mouseUpdate = function(o){
  	o.x = _m.x
  	o.y = _m.y
  }
}())


engine = function(){

	
	
	grapplingHook(person,block,0.005)
	gravityAffected.map(gravity)
	mousetrackable.map(mouseUpdate)
	moveable.map(move)
	Φable.map(function(o){
		Φ(o,block)
	})
}

loop = function(){
	!paused && engine()
	screenSetup()
	drawable.map(draw)
	stateDrawable.map(drawState)
}
reset()
//loop
setInterval(loop,0)	//0 is instant, 1000 is to do it once a second

