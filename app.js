con = can.getContext('2d')

screenSetup = function(){
	can.width = can.width
	con.translate(can.width/2,+can.height/2)
}
draw = function(o){
	E('Drawable').each(function(drawable,e){
		var o = E('Location',e)
		var d = E('Dimensions',e)
		con.fillRect(o.x-d.w/2,o.y-d.h/2,d.w,d.h)
	})
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
	
	//Natural length of pendulum-anchor cord.
		//Hard coded for now.
		//In future set to desired cord length or
		//Set to distance between pendulum and anchor when first connected.
		var r0 = 200
	
	var k = 0.005	//Stiffness of cord

	var E = (r-r0)*k	//Cord elasticity tension component

	var ax = (Wr - ρ - E) * cosθ * bPol
	var ay = (Wr - ρ - E) * sinθ * -1

	pendulum.vy = pendulum.vy+ay
	pendulum.vx = pendulum.vx+ax
	pendulum.r = r
	//pendulum.Φdeg = Φrad * 180 / Math.PI
}

drawState = function(o){
	E('StateDrawable').each(function(drawable,e){
		var i = 0;
		var spacing = 15;
		
		
		var o = E('Location',e)
		var d = E('Dimensions',e)
		
		con.font = '10pt Helvetica'
		for(var j = 0; j < drawable.include.length; j++ ){
			var componentName = drawable.include[j];
			var component = E(componentName,e)
			
			
			for(key in component){
				var val = component[key]
				con.fillText([componentName.slice(0,drawable.summarise),'.',key,':',val].join(''),o.x+d.w, o.y + d.h + i * spacing)
				i++
			}
			i++
		}
	
	})
}

reset = function () {
	E.components = {}
	var game = E({
		Paused: { value: false },
	})
	var mouse = E({
		Location: { x:0, y:0 },
		Velocity: { x:0 ,y:0 },
		Dimensions: {w:5, h: 5},
		MouseTrackable: {},
		Drawable: {},
		ΦAble: {}
	})
	var block = E({
		Location: { x:0, y:0 },
		Velocity: { x:0, y:0 },
		Dimensions: {w:10, h:10},
		Length: { value: 5},
		Drawable: {}
	})
	var person = E({
		Location: { x:10, y:-200 },
		Velocity: { x:0, y:0 },
		Dimensions: {w:5, h:5},
		Drawable: {},
		GravityAffected: { value:	0.005, max: 4 },
		StateDrawable: {
			summarise: 1,
			include: ['Location','Velocity','Dimensions','GravityAffected']
		}
	})
	
}



togglePause = function(){
	E('Paused').each(function(paused,e){
		paused.value = !paused.value
	})
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
		E('MouseTrackable', function(trackable,e){
			var o = E('Location',e)
			o.x = _m.x;
			o.y = _m.y;
		})
	}
}())


engine = function(){

	
	
	grapplingHook(person,block,0.005)
	gravityAffected.map(gravity)
	mouseUpdate()
	moveable.map(move)
	Φable.map(function(o){
		Φ(o,block)
	})
}

loop = function(){
	E('Paused').sample().value && engine()
	screenSetup()
	draw()
	drawState()
}
reset()
//loop
setInterval(loop,0)	//0 is instant, 1000 is to do it once a second

