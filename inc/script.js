var token = readCookie("token");
var player;
var documentation;
var timeline;
var leaderboard;

$(document).ready(function()
{
	binds();
	start();
});

function start()
{
	console.log("Token | Generating..");
	if(!token){
		token = generateToken();
		setCookie("token",token,100);
	}
	console.log("Token | "+token);

	console.log("Player | Loading..");
	$.ajax({ type: "POST", url: "http://blind.xxiivv.com/api.php", data: { route:"player", token:token } }).success(function( content_raw ) {

		try { player = JSON.parse(content_raw); }
		catch (e) { console.log(content_raw) };
		player_ready();

		console.log("Documentation | Loading..");
		$.ajax({ type: "POST", url: "http://blind.xxiivv.com/api.php", data: { route:"documentation" } }).success(function( content_raw ) {

			try { documentation = JSON.parse(content_raw); }
			catch (e) { console.log(content_raw) };
			documentation_ready();

		});

		console.log("Timeline | Loading..");
		$.ajax({ type: "POST", url: "http://blind.xxiivv.com/api.php", data: { route:"timeline" } }).success(function( content_raw ) {

			try { timeline = JSON.parse(content_raw); }
			catch (e) { console.log(content_raw) };
			timeline_ready();

		});	

		console.log("Leaderboard | Loading..");
		$.ajax({ type: "POST", url: "http://blind.xxiivv.com/api.php", data: { route:"leaderboard", token:token } }).done(function( content_raw ) {

			try { leaderboard = JSON.parse(content_raw); }
			catch (e) { console.log(content_raw) };
			leaderboard_ready();

		});	
	});
}

function player_ready()
{
	console.log("Player | Ready");

	$('#player_id').text(player.id);

	if(player.isAlive == 0){
		$('#player_status').html("Dead.");
		$('#player_respawn').css("display","inline");
	}
	else{
		$('#player_status').html("Alive.");
		$('#player_respawn').css("display","none");
	}

	// Terminal
	$('#terminal').text("");
	$('#terminal').val(player.script);
	renderTerminal();
}

function documentation_ready()
{
	console.log("Documentation | Ready");

	$('#documentation').text("");

	renderDocumentation();
}

function timeline_ready()
{
	console.log("Timeline | Ready");

	$('#timeline').text("");
	var day = timeline[0];
	var logs = timeline[1];
	$('#timeline').html(logs);
	$('#tab_timeline').html("# DAY "+day);
	$('#next_day').html("Day "+(parseInt(day)+1));
}

function leaderboard_ready()
{
	$('#player_rank').html(leaderboard.player.rank);
	$('#player_score').html(leaderboard.player.score);
	$('#players_alive').html(leaderboard.playersCount.alive+"/"+leaderboard.playersCount.total+" Players");

	var leaderboardText = "<span class='sh_rank'></span> <span class='sh_spacer'>|</span> <span class='sh_name'>Name</span> <span class='sh_spacer'>|</span> <span class='sh_score'>Score</span> <span class='sh_spacer'>|</span> <span class='sh_score'>Deaths</span> <span class='sh_spacer'>|</span> <span class='sh_score'>Streak</span>\n";
	var count = 0;
	$.each(leaderboard.players, function( index, value ) {
		if( parseInt(value[2]) > 0 ){
			leaderboardText += "<span class='sh_rank'>"+value[0]+"</span> <span class='sh_spacer'>|</span> <blindfolk class='sh_name'>"+value[1]+"</blindfolk> <span class='sh_spacer'>|</span> <span class='sh_score'>"+value[2]+" kills</span> <span class='sh_spacer'>|</span> <span class='sh_score'>"+value[4]+" deaths</span> <span class='sh_spacer'>|</span> <span class='sh_score'>"+value[5]+" streak</span> <span class='sh_spacer'>|</span> <span>"+(parseInt(value[3]) == 1 ? "Alive" : "")+"</span>\n";
		}
		if(count> 10){ return false; }
		count++;
	});
	$('#leaderboard').html(leaderboard.header+leaderboardText);

	renderLeaderboard();
}

function binds()
{
	$('#terminal').bind('input propertychange', function(){ 
		renderTerminal();
		$('#save').text('Save');
		$('#save').css('display','inline-block');
	});

	$('#save').bind( "click", function() { 
		save();
	});

	$('#player_respawn').bind( "click", function() { 
		respawn();
	});

	$('#tab_render').bind( "click", function() { 
		$('#terminal').show();
		$('#render').show(); $('#timeline').hide(); $('#documentation').hide();  $('#leaderboard').hide(); 
		$('#tab_render').attr('class','active'); $('#tab_timeline').attr('class',''); $('#tab_documentation').attr('class',''); $('#tab_leaderboard').attr('class','');
	});
	$('#tab_timeline').bind( "click", function() { 
		$('#tab_timeline').removeClass('notification');
		$('#terminal').hide();
		$('#render').hide(); $('#timeline').show(); $('#documentation').hide();  $('#leaderboard').hide(); 
		$('#tab_render').attr('class',''); $('#tab_timeline').attr('class','active'); $('#tab_documentation').attr('class',''); $('#tab_leaderboard').attr('class','');
	});
	$('#tab_documentation').bind( "click", function() { 
		$('#terminal').hide();
		$('#render').hide(); $('#timeline').hide(); $('#documentation').show();  $('#leaderboard').hide(); 
		$('#tab_render').attr('class',''); $('#tab_timeline').attr('class',''); $('#tab_documentation').attr('class','active'); $('#tab_leaderboard').attr('class',''); 
	});
	$('#tab_leaderboard').bind( "click", function() { 
		$('#terminal').hide();
		$('#render').hide(); $('#timeline').hide(); $('#documentation').hide(); $('#leaderboard').show(); 
		$('#tab_render').attr('class',''); $('#tab_timeline').attr('class',''); $('#tab_documentation').attr('class',''); $('#tab_leaderboard').attr('class','active'); 
	});
}

/* ===========================
>  API Connections
=========================== */

function renderDocumentation()
{
	var documentationText = "";

	documentationText += "<phase># Introduction</phase>\n\n";
	documentationText += documentation["introduction"]+"\n\n";
	documentationText += "<phase># Fighting Styles</phase>\n\n";
	documentationText += documentation["fighting"]+"\n\n";

	// Cases
	documentationText += "<phase># Cases Documentation</phase>\n\n";
	$.each(documentation["cases"][0], function( _case, value ) {
		documentationText += "<span class='sh_case'>case</span> <span class='sh_event'>"+_case+"</span> ";
		if(value['methods'].length > 0){
			documentationText += "[ "; $.each(value['methods'], function( index, _method ) { documentationText += ".<span class='sh_method'>"+_method+"</span> "; }); documentationText += "]";
		}
		documentationText += "\n<span class=''>"+value["docs"]+"</span>\n\n";
	});

	// Actions
	documentationText += "<phase># Actions Documentation</phase>\n\n";
	$.each(documentation["actions"][0], function( _case, value ) {
		documentationText += "<span class='sh_indent'>></span> <span class='sh_event'>"+_case+"</span> ";
		if(value['methods'].length > 0){
			documentationText += "[ "; $.each(value['methods'], function( index, _method ) { documentationText += ".<span class='sh_method'>"+_method+"</span> "; }); documentationText += "]";
		}
		documentationText += "\n<span class=''>"+value["docs"]+"</span>\n\n";
	});

	documentationText += "<phase># Exit</phase>\n\n";
	documentationText += documentation["credits"]+"\n\n";

	$('#documentation').html(documentationText);
}

function loadLeaderboard()
{
	$('#leaderboard').text("");

	$.ajax({ type: "POST", url: "http://blind.xxiivv.com/api.php", data: { route:"leaderboard", token:token } }).done(function( content_raw ) {
		var leaderboard = JSON.parse(content_raw);
		$('#player_rank').html(leaderboard.player.rank);
		$('#player_score').html(leaderboard.player.score);
		$('#players_alive').html(leaderboard.playersCount.alive+"/"+leaderboard.playersCount.total+" Players");

		var leaderboardText = "<span class='sh_rank'></span> <span class='sh_spacer'>|</span> <span class='sh_name'>Name</span> <span class='sh_spacer'>|</span> <span class='sh_score'>Score</span> <span class='sh_spacer'>|</span> <span class='sh_score'>Deaths</span> <span class='sh_spacer'>|</span> <span class='sh_score'>Streak</span>\n";
		var count = 0;
		$.each(leaderboard.players, function( index, value ) {
			if( parseInt(value[2]) > 0 ){
				leaderboardText += "<span class='sh_rank'>"+value[0]+"</span> <span class='sh_spacer'>|</span> <blindfolk class='sh_name'>"+value[1]+"</blindfolk> <span class='sh_spacer'>|</span> <span class='sh_score'>"+value[2]+" kills</span> <span class='sh_spacer'>|</span> <span class='sh_score'>"+value[4]+" deaths</span> <span class='sh_spacer'>|</span> <span class='sh_score'>"+value[5]+" streak</span> <span class='sh_spacer'>|</span> <span>"+(parseInt(value[3]) == 1 ? "Alive" : "")+"</span>\n";
			}
			if(count> 10){ return false; }
			count++;
		});
		$('#leaderboard').html(leaderboard.header+leaderboardText);

		renderLeaderboard();

	});
}

/* ===========================
>  Player Actions
=========================== */

function save()
{
	console.log("Player | Saving..");
	$('#save').text('Saving..');

	$.ajax({ type: "POST", url: "http://blind.xxiivv.com/api.php", data: { route:"terminal", token:token, script:$('#terminal').val() }}).done(function( content_raw ) {
		
		try { var newPlayer = JSON.parse(content_raw); }
		catch (e) { console.log(content_raw) };

		$('#save').hide();
		player_ready();
	});
}

function respawn()
{
	$.ajax({ type: "POST", url: "http://blind.xxiivv.com/api.php", data: { route:"respawn", token:token }}).done(function( content_raw ) {
		start();
	});
}

/* ===========================
>  Syntax Parsing
=========================== */

function renderTerminal()
{
	var text = syntaxHighlight($('#terminal').val());
	$('#render').html(text+"_");
	$('#memory').text(((($('#terminal').val().length/500)*100).toFixed(1))+"%");
}

function renderTimeline()
{
	var text = syntaxHighlight($('#timeline').text());
	$('#timeline').html(text);
}

function renderLeaderboard()
{
	$('#timeline blindfolk').each( function() { 
	  mytext =  $(this).text();  
	  if( player && mytext == player.id ){
	  	$(this).addClass("user"); 
	  }
	}); 
	$('#leaderboard blindfolk').each( function() { 
	  mytext =  $(this).text();  
	  if( player && mytext == player.id ){
	  	$(this).addClass("user"); 
	  }
	}); 
}

function syntaxHighlight(text)
{
	// Main
	text = text.replaceAll("case ", "<span class='sh_case'>case</span> ");
	// Actions
	text = text.replaceAll("block.", "<span class='sh_action'>block</span>.");
	text = text.replaceAll("move.", "<span class='sh_action'>move</span>.");
	text = text.replaceAll("attack.", "<span class='sh_action'>attack</span>.");
	text = text.replaceAll("turn.", "<span class='sh_action'>turn</span>.");
	text = text.replaceAll("step.", "<span class='sh_action'>step</span>.");
	text = text.replaceAll("say ", "<span class='sh_action'>say</span> ");
	text = text.replaceAll("idle", "<span class='sh_action'>idle</span>");
	// Events
	text = text.replaceAll(" collide", " <span class='sh_event'>collide</span>");
	text = text.replaceAll(" attack", " <span class='sh_event'>attack</span>");
	text = text.replaceAll(" death", " <span class='sh_event'>death</span>");
	text = text.replaceAll(" hit", " <span class='sh_event'>death</span>");
	text = text.replaceAll(" default", " <span class='sh_event'>default</span>");
	// Methods
	text = text.replaceAll(".high", ".<span class='sh_method'>high</span>");
	text = text.replaceAll(".low", ".<span class='sh_method'>low</span>");
	text = text.replaceAll(".forward", ".<span class='sh_method'>forward</span>");
	text = text.replaceAll(".backward", ".<span class='sh_method'>backward</span>");
	text = text.replaceAll(".back", ".<span class='sh_method'>back</span>");
	text = text.replaceAll(".right", ".<span class='sh_method'>right</span>");
	text = text.replaceAll(".left", ".<span class='sh_method'>left</span>");
	// Etc..
	text = text.replaceAll("  ", "<span class='sh_indent'>> </span>");
	return text;
}

/* ===========================
>  Counters
=========================== */

setInterval(function()
{
	var seconds = countdown();
	var secondsUntilNextDay = 900 - (seconds % 900);
	var minutesUntilNextDay = parseInt(secondsUntilNextDay/60);

	if(minutesUntilNextDay > 0){
		$('#until_next_day').text(minutesUntilNextDay+" Min "+(secondsUntilNextDay % 60)+" Sec");
	}
	else{
		$('#until_next_day').text((secondsUntilNextDay % 60)+" Seconds left");
	}

	// Refresh when day is over
	if(secondsUntilNextDay == 859){
		loadTimeline();
		$('#tab_timeline').addClass('notification');
	}

	renderLeaderboard();
}, 1000);

/* ===========================
>  Tools
=========================== */

String.prototype.replaceAll = function(search, replacement)
{
    var target = this;
    return target.split(search).join(replacement);
};

function setCookie(c_name,value,exdays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function readCookie(name)
{
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function countdown()
{
	time = new Date()
	return (time.getMinutes() * 60) + time.getSeconds(); 
}

function generateToken()
{
	var seg1 = Math.random().toString(36).substr(2);
	var seg2 = Math.random().toString(36).substr(2);
    return seg1+seg2;
};