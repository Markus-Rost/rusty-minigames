import { emojiNumberList, emojiMedalList, botPlayers, botPlayedGames } from '../util.js';

// /eval code:updateApplicationCommand('dontgetangry')

/** @typedef {'🔴'|'🟡'|'🟢'|'🔵'|'🟠'|'🟣'} emojiPlayerColor */

/** @type {emojiPlayerColor[]} */
const emojiPlayerColors = ['🔴', '🟡', '🟢', '🔵', '🟠', '🟣'];
const emojiLastMove = '🟫';

const gameBoard = [ [...`
🟨🟨⬛⬛⬜⬜🟩⬛⬛🟩🟩
🟨🟨⬛⬛⬜🟩⬜⬛⬛🟩🟩
⬛⬛⬛⬛⬜🟩⬜⬛⬛⬛⬛
⬛⬛⬛⬛⬜🟩⬜⬛⬛⬛⬛
🟨⬜⬜⬜⬜🟩⬜⬜⬜⬜⬜
⬜🟨🟨🟨🟨🐴🟦🟦🟦🟦⬜
⬜⬜⬜⬜⬜🟥⬜⬜⬜⬜🟦
⬛⬛⬛⬛⬜🟥⬜⬛⬛⬛⬛
⬛⬛⬛⬛⬜🟥⬜⬛⬛⬛⬛
🟥🟥⬛⬛⬜🟥⬜⬛⬛🟦🟦
🟥🟥⬛⬛🟥⬜⬜⬛⬛🟦🟦
`.trim()], [...`
⬛⬛⬛⬜⬜🟩⬛⬛⬛⬜⬜🟦⬛🟦🟦
🟨🟨⬛⬜🟩⬜⬜⬜⬜⬜🟦⬜⬛🟦🟦
🟨🟨⬛⬜🟩⬛⬛⬛⬛⬛🟦⬜⬛⬛⬛
⬛⬛⬛⬜🟩⬛🟩🟩⬛⬛🟦⬜⬛⬛⬛
⬛🟨⬜⬜🟩⬛🟩🟩⬛⬛🟦⬜⬜⬜⬛
⬛⬜🟨🟨🟨🟨⬛⬛⬛🟧🟧🟧🟧⬜⬛
⬛⬜⬜⬜🟥⬛⬛🟪🟪⬛🟪⬜⬜🟧⬛
⬛⬛⬛⬜🟥⬛⬛🟪🟪⬛🟪⬜⬛⬛⬛
⬛⬛⬛⬜🟥⬛⬛⬛⬛⬛🟪⬜⬛🟧🟧
🟥🟥⬛⬜🟥⬜⬜⬜⬜⬜🟪⬜⬛🟧🟧
🟥🟥⬛🟥⬜⬜⬛⬛⬛🟪⬜⬜⬛⬛⬛
`.trim()] ];

const redTOyellow = [124, 112, 100, 88, 76, 75, 74, 73, 72, 60];
const yellowTOgreen = [48, 49, 50, 51, 52, 40, 28, 16, 4, 5];
const greenTOblue = [6, 18, 30, 42, 54, 55, 56, 57, 58, 70];
const blueTOred = [82, 81, 80, 79, 78, 90, 102, 114, 126, 125];

const redTOyellowBig = [163, 147, 131, 115, 99, 98, 97, 81];
const yellowTOgreenBig = [65, 66, 67, 51, 35, 19, 3, 4];
const greenTOblueBig = [5, 21, 22, 23, 24, 25, 9, 10];
const blueTOorangeBig = [11, 27, 43, 59, 75, 76, 77, 93];
const orangeTOpurpleBig = [109, 108, 107, 123, 139, 155, 171, 170];
const purpleTOredBig = [169, 153, 152, 151, 150, 149, 165, 164];

/**
 * @typedef gamePlayer
 * @property {emojiPlayerColor} emoji
 * @property {Number[]} home
 * @property {Number[]} path
 * @property {Number[]} target
 */

/** @type {Object.<string, gamePlayer>[]} */
const gamePlayers = [
	{
		'🔴': {
			emoji: '🔴',
			home: [108, 109, 120, 121],
			path: [...redTOyellow, ...yellowTOgreen, ...greenTOblue, ...blueTOred, 113, 101, 89, 77],
			target: [113, 101, 89, 77]
		},
		'🟡': {
			emoji: '🟡',
			home: [0, 1, 12, 13],
			path: [...yellowTOgreen, ...greenTOblue, ...blueTOred, ...redTOyellow, 61, 62, 63, 64],
			target: [61, 62, 63, 64]
		},
		'🟢': {
			emoji: '🟢',
			home: [9, 10, 21, 22],
			path: [...greenTOblue, ...blueTOred, ...redTOyellow, ...yellowTOgreen, 17, 29, 41, 53],
			target: [17, 29, 41, 53]
		},
		'🔵': {
			emoji: '🔵',
			home: [117, 118, 129, 130],
			path: [...blueTOred, ...redTOyellow, ...yellowTOgreen, ...greenTOblue, 69, 68, 67, 66],
			target: [69, 68, 67, 66]
		},
		'🟠': {
			emoji: '🟠',
			home: [],
			path: [],
			target: []
		},
		'🟣': {
			emoji: '🟣',
			home: [],
			path: [],
			target: []
		}
	},
	{
		'🔴': {
			emoji: '🔴',
			home: [144, 145, 160, 161],
			path: [...redTOyellowBig, ...yellowTOgreenBig, ...greenTOblueBig, ...blueTOorangeBig, ...orangeTOpurpleBig, ...purpleTOredBig, 148, 132, 116, 100],
			target: [148, 132, 116, 100]
		},
		'🟡': {
			emoji: '🟡',
			home: [16, 17, 32, 33],
			path: [...yellowTOgreenBig, ...greenTOblueBig, ...blueTOorangeBig, ...orangeTOpurpleBig, ...purpleTOredBig, ...redTOyellowBig, 82, 83, 84, 85],
			target: [82, 83, 84, 85]
		},
		'🟢': {
			emoji: '🟢',
			home: [54, 55, 70, 71],
			path: [...greenTOblueBig, ...blueTOorangeBig, ...orangeTOpurpleBig, ...purpleTOredBig, ...redTOyellowBig, ...yellowTOgreenBig, 20, 36, 52, 68],
			target: [20, 36, 52, 68]
		},
		'🔵': {
			emoji: '🔵',
			home: [13, 14, 29, 30],
			path: [...blueTOorangeBig, ...orangeTOpurpleBig, ...purpleTOredBig, ...redTOyellowBig, ...yellowTOgreenBig, ...greenTOblueBig, 26, 42, 58, 74],
			target: [26, 42, 58, 74]
		},
		'🟠': {
			emoji: '🟠',
			home: [141, 142, 157, 158],
			path: [...orangeTOpurpleBig, ...purpleTOredBig, ...redTOyellowBig, ...yellowTOgreenBig, ...greenTOblueBig, ...blueTOorangeBig, 92, 91, 90, 89],
			target: [92, 91, 90, 89]
		},
		'🟣': {
			emoji: '🟣',
			home: [103, 104, 119, 120],
			path: [...purpleTOredBig, ...redTOyellowBig, ...yellowTOgreenBig, ...greenTOblueBig, ...blueTOorangeBig, ...orangeTOpurpleBig, 154, 138, 122, 106],
			target: [154, 138, 122, 106]
		}
	}
];

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
function dontgetangry_slash(interaction) {
	/** @type {{id: String, username: String, color: emojiPlayerColor}[]} */
	let playerUsers = [
		interaction.user,
		interaction.options.getUser('player2'),
		interaction.options.getUser('player3'),
		interaction.options.getUser('player4'),
		interaction.options.getUser('player5'),
		interaction.options.getUser('player6')
	].filter( playerUser => playerUser && ( !playerUser.bot || botPlayers.has(playerUser.id) ) ).map( playerUser => {
		return {
			id: playerUser.id,
			username: playerUser.username,
			color: null
		};
	} );
	if ( playerUsers.length < ( interaction.options.data.filter( option => option.type === ApplicationCommandOptionType.User ).length + 1 ) ) {
		return interaction.reply( {
			content: ( isGermanInteraction(interaction) ? 'Du kannst nicht gegen unbekannte Bots spielen!' : 'You can\'t play against unknown bots!' ),
			ephemeral: true
		} ).catch( error => console.log( '- ' + error ) );
	}
	let isBig = ( playerUsers.length > 4 ? 1 : 0 );
	let gameGrid = gameBoard[isBig].slice();
	let text = `**Mensch ärgere Dich nicht**\n`;
	if ( playerUsers.length === 2 ) {
		playerUsers[0].color = emojiPlayerColors[0];
		playerUsers[1].color = emojiPlayerColors[2];
		text += `<@${playerUsers[0].id}> (${playerUsers[0].color}) vs. <@${playerUsers[1].id}> (${playerUsers[1].color})`;
		gamePlayers[isBig][playerUsers[0].color].home.forEach( fieldPos => gameGrid[fieldPos] = playerUsers[0].color );
		gamePlayers[isBig][playerUsers[1].color].home.forEach( fieldPos => gameGrid[fieldPos] = playerUsers[1].color );
	}
	else {
		let gamePlayer = gamePlayers[isBig];
		text += playerUsers.map( (playerUser, i) => {
			playerUser.color = emojiPlayerColors[i];
			gamePlayer[playerUser.color].home.forEach( fieldPos => gameGrid[fieldPos] = playerUser.color );
			return `<@${playerUser.id}> (${playerUser.color})`;
		} ).join(' vs. ');
	}
	let components = [
		new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('dontgetangry_die').setEmoji('🎲')
	];
	if ( playerUsers.length === 3 ) {
		components.push(new ButtonBuilder().setStyle(ButtonStyle.Danger).setCustomId('dontgetangry_big').setEmoji('♻️'));
	}
	let startingPlayer = playerUsers[1];
	while ( botPlayers.has(startingPlayer.id) ) {
		startingPlayer = playerUsers[playerUsers.indexOf(startingPlayer) + 1];
		if ( !startingPlayer ) {
			startingPlayer = playerUsers[0];
			break;
		}
	}
	let allowJoin = interaction.options.getBoolean('allow-join');
	if ( allowJoin ) startingPlayer = playerUsers[0];
	let joinButton = new ButtonBuilder().setStyle(ButtonStyle.Success).setCustomId('dontgetangry_join').setEmoji('🆕');
	if ( isGermanGuild(interaction) ) {
		text += `\n<@${startingPlayer.id}> (${startingPlayer.color}) ist am Zug.`;
		components[0].setLabel('Würfel.');
		if ( components[1] ) components[1].setLabel('Wechsle zum 6v6-Brett.');
		if ( allowJoin ) joinButton.setLabel('Tritt dem Spiel als zusätzlicher Spieler bei!');
	}
	else {
		text += `\nIt's <@${startingPlayer.id}> (${startingPlayer.color}) turn.`;
		components[0].setLabel('Roll the dice.');
		if ( components[1] ) components[1].setLabel('Switch to the 6v6 board.');
		if ( allowJoin ) joinButton.setLabel('Join the game as additional player!');
	}
	let componentRows = [new ActionRowBuilder().addComponents(...components)];
	if ( allowJoin ) componentRows.push(new ActionRowBuilder().addComponents(joinButton));
	if ( interaction.guildId === '417255782820872192' ) return interaction.deferReply().then( () => {
		interaction.guild.channels.cache.get('878593019119546379').send( {
			content: text + '\n\n' + gameGrid.join(''),
			allowedMentions: {
				users: [...new Set(playerUsers.map( playerUser => playerUser.id ))]
			},
			components: componentRows
		} ).then( message => {
			message.startThread( {
				name: playerUsers.map( playerUser => playerUser.username ).join(' vs. ').substring(0, 100),
				autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
				reason: 'Mensch ärgere Dich nicht'
			} ).catch( error => console.log( '- ' + error ) );
			return interaction.editReply( {
				content: '**Mensch ärgere Dich nicht**\n' + text.split('\n')[1] + `\nGespielt wird in <#878593019119546379>, für Diskussionen steht <#${message.id}> zur Verfügung.`,
				allowedMentions: {
					users: [...new Set(playerUsers.map( playerUser => playerUser.id ))]
				},
				components: [new ActionRowBuilder().addComponents(
					new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(message.url).setEmoji('🎲').setLabel('Zum Spielbrett.')
				)]
			} ).catch( error => console.log( '- ' + error ) );
		}, error => console.log( '- ' + error ) );
	}, error => console.log( '- ' + error ) );
	return interaction.reply( {
		content: text + '\n\n' + gameGrid.join(''),
		allowedMentions: {
			users: [...new Set(playerUsers.map( playerUser => playerUser.id ))]
		},
		components: componentRows
	} ).catch(  error => console.log( '- ' + error ) );
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {String[]} playerList
 */
function dontgetangry_join(interaction, ...playerList) {
	let text = interaction.message.content.split('\n');
	let gameGrid = [...text.splice(-11).join('\n')];
	let isBig = ( gameGrid.length > 150 ? 1 : 0 );
	playerList = playerList.filter( player => player ).slice(0, -1);
	if ( playerList.length >= 6 ) return interaction.reply( {
		content: ( isGermanInteraction(interaction) ? 'Das Spiel ist bereits voll!' : 'The game is already full!' ),
		ephemeral: true
	} ).catch( error => console.log( '- ' + error ) );
	if ( !isBig && playerList.length >= 4 ) {
		isBig = 1;
		gameGrid = gameBoard[isBig].slice();
		emojiPlayerColors.filter( playerColor => text[1].includes( playerColor ) ).forEach( playerColor => {
			gamePlayers[isBig][playerColor].home.forEach( homePos => gameGrid[homePos] = playerColor );
		} );
	}
	let playerColor = emojiPlayerColors.find( playerColor => !text[1].includes( playerColor ) );
	gamePlayers[isBig][playerColor].home.forEach( homePos => gameGrid[homePos] = playerColor );
	let players = text[1].split(' vs. ');
	players.splice(emojiPlayerColors.indexOf(playerColor), 0, `<@${interaction.user.id}> (${playerColor})`);
	text[1] = players.join(' vs. ');
	let components = [
		new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('dontgetangry_die').setEmoji('🎲')
	];
	if ( players.length === 3 ) {
		components.push(new ButtonBuilder().setStyle(ButtonStyle.Danger).setCustomId('dontgetangry_big').setEmoji('♻️'));
	}
	let joinButton = new ButtonBuilder().setStyle(ButtonStyle.Success).setCustomId('dontgetangry_join').setEmoji('🆕');
	if ( players.length === 6 ) joinButton.setDisabled();
	if ( isGermanGuild(interaction) ) {
		components[0].setLabel('Würfel.');
		if ( components[1] ) components[1].setLabel('Wechsle zum 6v6-Brett.');
		joinButton.setLabel('Tritt dem Spiel als zusätzlicher Spieler bei!');
	}
	else {
		components[0].setLabel('Roll the dice.');
		if ( components[1] ) components[1].setLabel('Switch to the 6v6 board.');
		joinButton.setLabel('Join the game as additional player!');
	}
	let componentRows = [
		new ActionRowBuilder().addComponents(...components),
		new ActionRowBuilder().addComponents(joinButton)
	];
	return interaction.update( {
		content: text.join('\n') + '\n' + gameGrid.join(''),
		allowedMentions: {users: [playerList[0]]},
		components: componentRows
	} ).catch( error => console.log( '- ' + error ) );
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {String[]} playerList
 */
function dontgetangry_button(interaction, ...[player1, player2, player3, player4, player5, player6, currentPlayer]) {
	if ( !currentPlayer ) {
		if ( player6 ) {
			currentPlayer = player6;
			player6 = null;
		}
		else if ( player5 ) {
			currentPlayer = player5;
			player5 = null;
		}
		else if ( player4 ) {
			currentPlayer = player4;
			player4 = null;
		}
		else if ( player3 ) {
			currentPlayer = player3;
			player3 = null;
		}
	}
	if ( botPlayedGames.has(interaction.message.id) ) {
		if ( interaction.user.id !== currentPlayer && !botPlayers.has(interaction.user.id) ) {
			return interaction.reply( {
				content: ( isGermanInteraction(interaction) ? 'Du bist gerade nicht am Zug.' : 'It\'s not your turn right now.' ),
				ephemeral: true
			} ).catch( error => console.log( '- ' + error ) );
		}
		let text = '🤖 ';
		if ( isGermanInteraction(interaction) ) {
			text += 'Der Computer spielt derzeit für dich.\n';
			if ( botPlayers.has(interaction.user.id) ) text += 'Nutze `?imabot` um wieder zu übernehmen.';
			else text += 'Bitte warte noch einen Augenblick bevor du wieder übernehmen kannst.';
		}
		else {
			text += 'The computer is currently playing for you.\n';
			if ( botPlayers.has(interaction.user.id) ) text += 'Use `?imabot` to take over again.';
			else text += 'Please wait a moment before you can take over again.';
		}
		return interaction.reply( {
			content: text,
			ephemeral: true
		} ).catch( error => console.log( '- ' + error ) );
	}
	if ( interaction.customId === 'dontgetangry_big' ) {
		let gameGrid = gameBoard[1].slice();
		let text = `**Mensch ärgere Dich nicht**\n`;
		text += `<@${player1}> (${emojiPlayerColors[0]}) vs. <@${player2}> (${emojiPlayerColors[2]}) vs. <@${player3}> (${emojiPlayerColors[4]})`;
		gamePlayers[1][emojiPlayerColors[0]].home.forEach( fieldPos => gameGrid[fieldPos] = emojiPlayerColors[0] );
		gamePlayers[1][emojiPlayerColors[2]].home.forEach( fieldPos => gameGrid[fieldPos] = emojiPlayerColors[2] );
		gamePlayers[1][emojiPlayerColors[4]].home.forEach( fieldPos => gameGrid[fieldPos] = emojiPlayerColors[4] );
		let button = new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('dontgetangry_die').setEmoji('🎲');
		let startingPlayer = `<@${player2}> (${emojiPlayerColors[2]})`;
		if ( botPlayers.has(player2) ) startingPlayer = `<@${player3}> (${emojiPlayerColors[4]})`;
		if ( botPlayers.has(player3) ) startingPlayer = `<@${player1}> (${emojiPlayerColors[0]})`;
		if ( interaction.message.components[1] ) startingPlayer = `<@${player1}> (${emojiPlayerColors[0]})`;
		if ( isGermanGuild(interaction) ) {
			text += `\n${startingPlayer} ist am Zug.`;
			button.setLabel('Würfel.');
		}
		else {
			text += `\nIt's ${startingPlayer} turn.`;
			button.setLabel('Roll the dice.');
		}
		let components = [new ActionRowBuilder().addComponents(button)];
		if ( interaction.message.components[1] ) components.push(new ActionRowBuilder().addComponents(interaction.message.components[1].components[0]));
		return interaction.update( {
			content: text + '\n\n' + gameGrid.join(''),
			allowedMentions: {users: [player1]},
			components
		} ).catch( error => console.log( '- ' + error ) );
	}
	if ( interaction.user.id !== currentPlayer ) {
		return interaction.reply( {
			content: ( isGermanInteraction(interaction) ? 'Du bist gerade nicht am Zug.' : 'It\'s not your turn right now.' ),
			ephemeral: true
		} ).catch( error => console.log( '- ' + error ) );
	}
	let winnerText = '';
	if ( interaction.message.content.split('\n\n').length === 3 ) winnerText = '\n\n' + interaction.message.content.split('\n\n')[1];
	let gameGrid = [...interaction.message.content.replace( /\uFE0F\u20E3/g, '' ).split('\n').slice(-11).join('\n')];
	let isBig = ( gameGrid.length > 150 ? 1 : 0 );
	if ( gameGrid.includes( emojiLastMove ) ) gameGrid[gameGrid.indexOf(emojiLastMove)] = gameBoard[isBig][gameGrid.indexOf(emojiLastMove)];
	if ( gameGrid.includes( '1' ) ) gameGrid[gameGrid.indexOf('1')] = emojiNumberList[0];
	if ( gameGrid.includes( '2' ) ) gameGrid[gameGrid.indexOf('2')] = emojiNumberList[1];
	if ( gameGrid.includes( '3' ) ) gameGrid[gameGrid.indexOf('3')] = emojiNumberList[2];
	if ( gameGrid.includes( '4' ) ) gameGrid[gameGrid.indexOf('4')] = emojiNumberList[3];
	/** @type {emojiPlayerColor[]} */
	let playerColor = interaction.message.content.match(/(?<=\()(?:🔴|🟡|🟢|🔵|🟠|🟣)(?=\))/g);
	let players = [
		{
			index: 0,
			id: player1,
			emoji: playerColor[0]
		},
		{
			index: 1,
			id: player2,
			emoji: playerColor[1]
		}
	];
	if ( player3 ) players.push({
		index: 2,
		id: player3,
		emoji: playerColor[2]
	});
	if ( player4 ) players.push({
		index: 3,
		id: player4,
		emoji: playerColor[3]
	});
	if ( player5 ) players.push({
		index: 4,
		id: player5,
		emoji: playerColor[4]
	});
	if ( player6 ) players.push({
		index: 5,
		id: player6,
		emoji: playerColor[5]
	});
	let gamePlayer = gamePlayers[isBig][playerColor[players.length]];
	if ( interaction.customId === 'dontgetangry_giveup' ) {
		let buttons = [
			new ButtonBuilder().setStyle(ButtonStyle.Danger).setCustomId('dontgetangry_giveup_yes').setEmoji('☠️'),
			new ButtonBuilder().setStyle(ButtonStyle.Success).setCustomId('dontgetangry_giveup_no').setEmoji('↪️')
		];
		if ( isGermanGuild(interaction) ) {
			buttons[0].setLabel('Aufgeben!');
			buttons[1].setLabel('Nicht aufgeben!');
		}
		else {
			buttons[0].setLabel('Give up!');
			buttons[1].setLabel('Don\'t give up!');
		}
		return interaction.update( {
			allowedMentions: {users: [currentPlayer]},
			components: [new ActionRowBuilder().addComponents(...buttons)]
		} ).catch( error => console.log( '- ' + error ) );
	}
	if ( interaction.customId === 'dontgetangry_giveup_no' ) {
		let buttons = [
			new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('dontgetangry_die').setEmoji('🎲'),
			new ButtonBuilder().setStyle(ButtonStyle.Danger).setCustomId('dontgetangry_giveup').setEmoji('☠️')
		];
		if ( isGermanGuild(interaction) ) {
			buttons[0].setLabel('Würfel.');
			buttons[1].setLabel('Aufgeben?');
		}
		else {
			buttons[0].setLabel('Roll the dice.');
			buttons[1].setLabel('Give up?');
		}
		return interaction.update( {
			allowedMentions: {users: [currentPlayer]},
			components: [new ActionRowBuilder().addComponents(...buttons)]
		} ).catch( error => console.log( '- ' + error ) );
	}
	if ( interaction.customId === 'dontgetangry_giveup_yes' ) {
		let text = '**Mensch ärgere Dich nicht**\n' + interaction.message.content.split('\n')[1].replace( `<@${currentPlayer}> (${gamePlayer.emoji})`, `~~*<@${currentPlayer}>* (${gamePlayer.emoji})~~` );
		while ( gameGrid.includes( gamePlayer.emoji ) ) {
			let i = gameGrid.indexOf(gamePlayer.emoji);
			gameGrid[i] = gameBoard[isBig][i];
		}
		gamePlayer.target.forEach( targetPos => gameGrid[targetPos] = gamePlayer.emoji );
		let activePlayers = players.filter( player => !gamePlayers[isBig][player.emoji].target.every( targetPos => {
			return ( gameGrid[targetPos] !== gameBoard[isBig][targetPos] );
		} ) );
		let isCPU = false;
		let allowedMentions = {parse: []};
		let components = [];
		let nextPlayer = players.find( player => player.emoji === gamePlayer.emoji );
		if ( activePlayers.length < 2 || activePlayers.every( player => botPlayers.has(player.id) ) ) {
			if ( interaction.channelId === '878593019119546379' && interaction.message.hasThread ) {
				interaction.message.thread?.setAutoArchiveDuration?.(ThreadAutoArchiveDuration.OneHour, 'Spiel ist zuende.').catch( error => console.log( '- ' + error ) );
			}
		}
		else {
			let i = 0;
			nextPlayer = ( players[nextPlayer.index + 1] || players[0] );
			while ( gamePlayers[isBig][nextPlayer.emoji].target.every( targetPos => gameGrid[targetPos] === nextPlayer.emoji ) ) {
				nextPlayer = ( players[nextPlayer.index + 1] || players[0] );
				if ( i++ > 6 ) break;
			}
			isCPU = botPlayers.has(nextPlayer.id);
			allowedMentions = {users: [nextPlayer.id]};
			let buttons = [
				new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('dontgetangry_die').setEmoji('🎲'),
				new ButtonBuilder().setStyle(ButtonStyle.Danger).setCustomId('dontgetangry_giveup').setEmoji('☠️')
			];
			if ( isGermanGuild(interaction) ) {
				text += `\n${( isCPU ? '🤖 ' : '' )}<@${nextPlayer.id}> (${nextPlayer.emoji}) ist am Zug.`;
				buttons[0].setLabel('Würfel.');
				buttons[1].setLabel('Aufgeben?');
			}
			else {
				text += `\nIt's ${( isCPU ? '🤖 ' : '' )}<@${nextPlayer.id}> (${nextPlayer.emoji}) turn.`;
				buttons[0].setLabel('Roll the dice.');
				buttons[1].setLabel('Give up?');
			}
			if ( isCPU ) {
				buttons.pop();
				botPlayedGames.add(interaction.message.id);
			}
			components.push(new ActionRowBuilder().addComponents(...buttons));
		}
		return interaction.update( {
			content: text + winnerText + '\n\n' + gameGrid.join(''),
			allowedMentions, components,
			fetchReply: isCPU && components.length
		} ).then( msg => {
			if ( isCPU && components.length ) {
				if ( msg ) interaction.message = msg;
				let nextGamePlayer = gamePlayers[isBig][nextPlayer.emoji];
				setTimeout( dontgetangry_rollDice, 3000, interaction, gameGrid, isBig, nextGamePlayer, players, nextPlayer.id, winnerText );
			}
		}, error => console.log( '- ' + error ) );
	}
	if ( interaction.customId === 'dontgetangry_die' ) return dontgetangry_rollDice(interaction, gameGrid, isBig, gamePlayer, players, currentPlayer, winnerText);
	let fieldClicked = +interaction.customId.replace( 'dontgetangry_', '' );
	let numberRolled = +interaction.message.content.match(/\*\*([1-6])\*\*/)[1];
	return dontgetangry_movePiece(interaction, gameGrid, isBig, fieldClicked, numberRolled, gamePlayer, players, currentPlayer, winnerText);
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {String[]} gameGrid
 * @param {0|1} isBig
 * @param {gamePlayer} gamePlayer
 * @param {Object[]} players
 * @param {Number} players.index
 * @param {String} players.id
 * @param {emojiPlayerColor} players.emoji
 * @param {String} currentPlayer
 * @param {String} winnerText
 */
function dontgetangry_rollDice(interaction, gameGrid, isBig, gamePlayer, players, currentPlayer, winnerText = '') {
	let isCPU = botPlayers.has(currentPlayer);
	if ( isCPU ) botPlayedGames.add(interaction.message.id);
	let numberRolled = Math.floor(Math.random() * 6) + 1;
	let text = '**Mensch ärgere Dich nicht**\n' + interaction.message.content.split('\n')[1];
	/** @type {ButtonBuilder[]} */
	let components = [];
	let currentTry = 0;
	let inHome = gamePlayer.home.filter( fieldPos => gameGrid[fieldPos] === gamePlayer.emoji ).length;
	let inTarget = +( gameGrid[gamePlayer.target[3]] === gamePlayer.emoji );
	if ( inTarget ) inTarget += +( gameGrid[gamePlayer.target[2]] === gamePlayer.emoji );
	if ( inTarget === 2 ) inTarget += +( gameGrid[gamePlayer.target[1]] === gamePlayer.emoji );
	if ( ( inHome + inTarget ) === 4 ) {
		currentTry = +( interaction.message.content.match(/\*\*#?((?<=#)[1-3]|[1-3](?=\.))\.?\*\*/)?.[1] || 0 ) + 1;
	}
	let fieldClickedCPU = -1;
	if ( currentTry && numberRolled !== 6 ) {
		components.push(new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('dontgetangry_die').setEmoji('🎲'));
		if ( isGermanGuild(interaction) ) components[0].setLabel('Würfel.');
		else components[0].setLabel('Roll the dice.');
		if ( currentTry >= 3 ) components[0].setDisabled();
	}
	else {
		/** @type {{pos: Number, disabled: Boolean, scoreCPU: Number}[]} */
		let playerPos = [];
		let isHome = gamePlayer.home.some( homePos => gameGrid[homePos] === gamePlayer.emoji );
		let isStart = ( gameGrid[gamePlayer.path[0]] === gamePlayer.emoji );
		if ( isHome ) gamePlayer.home.forEach( (fieldPos, moveCount) => {
			if ( gameGrid[fieldPos] === gamePlayer.emoji ) {
				let posInfo = {
					pos: fieldPos,
					disabled: false,
					scoreCPU: 4 - moveCount
				};
				playerPos.push(posInfo);
				if ( numberRolled !== 6 || isStart ) posInfo.disabled = true;
			}
		} );
		if ( playerPos.length < 4 ) gamePlayer.path.forEach( (fieldPos, moveCount) => {
			if ( gameGrid[fieldPos] === gamePlayer.emoji ) {
				let posInfo = {
					pos: fieldPos,
					disabled: false,
					scoreCPU: 0
				};
				playerPos.push(posInfo);
				let newPos = gamePlayer.path[moveCount + numberRolled];
				if ( !newPos || gameGrid[newPos] === gamePlayer.emoji ) {
					posInfo.disabled = true;
					return;
				}
				if ( numberRolled === 6 && isHome && !isStart ) {
					posInfo.disabled = true;
					return;
				}
				if ( isStart && moveCount && isHome && gameGrid[gamePlayer.path[numberRolled]] !== gamePlayer.emoji ) {
					posInfo.disabled = true;
					return;
				}
				if ( gamePlayer.target.includes( newPos ) ) {
					let targetPosIndex = gamePlayer.target.indexOf( newPos ) + 1;
					let startTargetCheck = targetPosIndex - numberRolled;
					if ( startTargetCheck < 0 ) startTargetCheck = 0;
					if ( gamePlayer.target.slice(startTargetCheck, targetPosIndex).some( targetPos => gameGrid[targetPos] === gamePlayer.emoji ) ) {
						posInfo.disabled = true;
						return;
					}
				}
				if ( isCPU ) {
					if ( gamePlayer.target.includes( newPos ) ) {
						posInfo.scoreCPU += 0.05;
						if ( !gamePlayer.target.includes( gamePlayer.path[moveCount] ) ) {
							posInfo.scoreCPU += 0.75;
						}
						else if ( gamePlayer.target[0] === gamePlayer.path[moveCount] ) {
							posInfo.scoreCPU += 0.25;
						}
						if ( ( gamePlayer.target.indexOf( newPos ) + inHome ) === 3 ) {
							posInfo.scoreCPU += 0.45;
						}
					}
					else {
						if ( gameGrid[newPos] !== gameBoard[isBig][newPos] ) {
							let kickedPlayerPath = gamePlayers[isBig][gameGrid[newPos]].path;
							posInfo.scoreCPU += kickedPlayerPath.indexOf(newPos) / kickedPlayerPath.length;
						}
						if ( gameGrid[newPos] !== '⬜' ) {
							posInfo.scoreCPU -= 0.05;
						}
						if ( gameBoard[isBig][gamePlayer.path[moveCount]] !== '⬜' ) {
							posInfo.scoreCPU += 0.05;
						}
						for (let i = 1; i < numberRolled; i++) {
							let jumpedPos = gamePlayer.path[moveCount + i];
							if ( gameGrid[jumpedPos] !== gameBoard[isBig][jumpedPos] && gameGrid[jumpedPos] !== gamePlayer.emoji ) {
								if ( gamePlayer.path.indexOf(jumpedPos) / gamePlayer.path.length > 0.75 && numberRolled !== 6 ) {
									posInfo.scoreCPU -= ( gamePlayer.path.indexOf(jumpedPos) / gamePlayer.path.length ) - 0.75;
								}
								let jumpedPlayerPath = gamePlayers[isBig][gameGrid[jumpedPos]].path;
								if ( jumpedPlayerPath.indexOf(jumpedPos) / jumpedPlayerPath.length > 0.5 ) {
									posInfo.scoreCPU -= ( jumpedPlayerPath.indexOf(jumpedPos) / jumpedPlayerPath.length ) - 0.5;
								}
							}
						}
					}
				}
			}
		} );
		components.push(...playerPos.map( (posInfo, i) => {
			gameGrid[posInfo.pos] = emojiNumberList[i];
			return new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('dontgetangry_' + i).setEmoji(emojiNumberList[i]).setDisabled(posInfo.disabled);
		} ));
		if ( isCPU ) {
			let playerPosCPU = playerPos.map( ({disabled, scoreCPU}, i) => {
				return {disabled, scoreCPU, index: i};
			} ).filter( posInfo => !posInfo.disabled ).reverse();
			if ( currentPlayer === '1239601207694331914' /* Rusty Minigames */ ) playerPosCPU;
			else if ( currentPlayer === '809717142983147552' /* Rostiger Bot */ ) playerPosCPU;
			else if ( currentPlayer === '461189216198590464' /* Wiki-Bot */ ) playerPosCPU.reverse();
			else if ( currentPlayer === '432468082175246351' /* Wiki-Bot (Test) */ ) playerPosCPU.forEach( posInfo => posInfo.scoreCPU = Math.floor(Math.abs(posInfo.scoreCPU)) );
			else if ( currentPlayer === '483003112831975424' /* Curious Chicken */ ) playerPosCPU.forEach( posInfo => posInfo.scoreCPU += Math.random() );
			else playerPosCPU.forEach( posInfo => posInfo.scoreCPU = Math.random() );
			fieldClickedCPU = playerPosCPU.sort( (a, b) => {
				if ( b.scoreCPU === a.scoreCPU && Math.random() > 0.9 ) return Math.random() - 0.5;
				return b.scoreCPU - a.scoreCPU;
			} )[0]?.index;
		}
	}
	if ( isGermanGuild(interaction) ) {
		text += `\n${( isCPU ? '🤖 ' : '' )}<@${currentPlayer}> (${gamePlayer.emoji}) ist am Zug und hat eine **${numberRolled}** gewürfelt.`;
		if ( currentTry ) text += ` Dies war der **${currentTry}.** Versuch.`;
	}
	else {
		text += `\nIt's ${( isCPU ? '🤖 ' : '' )}<@${currentPlayer}> (${gamePlayer.emoji}) turn and they rolled a **${numberRolled}**.`;
		if ( currentTry ) text += ` This was their **#${currentTry}** try.`;
	}
	let message = {
		content: text + winnerText + '\n\n' + gameGrid.join(''),
		allowedMentions: {
			users: [currentPlayer]
		},
		components: [new ActionRowBuilder().addComponents(...components)],
		fetchReply: isCPU || components.every( component => component.data.disabled )
	};
	return ( interaction.replied ? interaction.editReply( message ) : interaction.update( message ) ).then( msg => {
		if ( components.every( component => component.data.disabled ) ) {
			if ( msg ) interaction.message = msg;
			let newText = '**Mensch ärgere Dich nicht**\n' + interaction.message.content.split('\n')[1];
			let components = [new ActionRowBuilder()];
			let buttons = [
				new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('dontgetangry_die').setEmoji('🎲')
			];
			let allowedMentions = {users: []};
			let nextPlayer = players.find( player => player.emoji === gamePlayer.emoji );
			if ( numberRolled === 6 ) {
				allowedMentions.users.push(currentPlayer);
				if ( isGermanGuild(interaction) ) {
					newText += `\n${( isCPU ? '🤖 ' : '' )}<@${currentPlayer}> (${gamePlayer.emoji}) ist immer noch am Zug.`;
					buttons[0].setLabel('Würfel.');
				}
				else {
					newText += `\nIt's still ${( isCPU ? '🤖 ' : '' )}<@${currentPlayer}> (${gamePlayer.emoji}) turn.`;
					buttons[0].setLabel('Roll the dice.');
				}
			}
			else if ( players.filter( player => !gamePlayers[isBig][player.emoji].target.every( targetPos => {
				return ( gameGrid[targetPos] !== gameBoard[isBig][targetPos] && gameGrid[targetPos] !== emojiLastMove );
			} ) ).every( player => botPlayers.has(player.id) ) ) {
				components = [];
				gameGrid[gameGrid.indexOf(emojiLastMove)] = gameBoard[isBig][gameGrid.indexOf(emojiLastMove)];
				if ( interaction.channelId === '878593019119546379' && interaction.message.hasThread ) {
					interaction.message.thread?.setAutoArchiveDuration(ThreadAutoArchiveDuration.OneHour, 'Spiel ist zuende.').catch( error => console.log( '- ' + error ) );
				}
			}
			else {
				let i = 0;
				nextPlayer = ( players[nextPlayer.index + 1] || players[0] );
				while ( gamePlayers[isBig][nextPlayer.emoji].target.every( targetPos => gameGrid[targetPos] === nextPlayer.emoji ) ) {
					nextPlayer = ( players[nextPlayer.index + 1] || players[0] );
					if ( i++ > 6 ) break;
				}
				isCPU = botPlayers.has(nextPlayer.id);
				allowedMentions.users.push(nextPlayer.id);
				buttons.push(new ButtonBuilder().setStyle(ButtonStyle.Danger).setCustomId('dontgetangry_giveup').setEmoji('☠️'));
				if ( isGermanGuild(interaction) ) {
					newText += `\n${( isCPU ? '🤖 ' : '' )}<@${nextPlayer.id}> (${nextPlayer.emoji}) ist am Zug.`;
					buttons[0].setLabel('Würfel.');
					buttons[1].setLabel('Aufgeben?');
				}
				else {
					newText += `\nIt's ${( isCPU ? '🤖 ' : '' )}<@${nextPlayer.id}> (${nextPlayer.emoji}) turn.`;
					buttons[0].setLabel('Roll the dice.');
					buttons[1].setLabel('Give up?');
				}
				if ( isCPU ) {
					buttons.pop();
					botPlayedGames.add(interaction.message.id);
				}
			}
			if ( components.length ) components[0].addComponents(...buttons);
			setTimeout( message2 => {
				return interaction.editReply( message2 ).then( msg2 => {
					if ( isCPU && components.length ) {
						if ( msg2 ) interaction.message = msg2;
						let nextGameGrid = [...gameGrid.join('').replace( /1️⃣|2️⃣|3️⃣|4️⃣/g, gamePlayer.emoji )];
						let nextGamePlayer = gamePlayers[isBig][nextPlayer.emoji];
						setTimeout( dontgetangry_rollDice, 3000, interaction, nextGameGrid, isBig, nextGamePlayer, players, nextPlayer.id, winnerText );
					}
					else botPlayedGames.delete(interaction.message.id);
				}, error => console.log( '- ' + error ) );
			}, 3000, {
				content: newText + winnerText + '\n\n' + gameGrid.join('').replace( /1️⃣|2️⃣|3️⃣|4️⃣/g, gamePlayer.emoji ),
				allowedMentions, components
			} );
		}
		else if ( isCPU ) {
			if ( msg ) interaction.message = msg;
			if ( fieldClickedCPU === -1 ) setTimeout( dontgetangry_rollDice, 3000, interaction, gameGrid, isBig, gamePlayer, players, currentPlayer, winnerText );
			else setTimeout( dontgetangry_movePiece, 3000, interaction, gameGrid, isBig, fieldClickedCPU, numberRolled, gamePlayer, players, currentPlayer, winnerText );
		}
		else botPlayedGames.delete(interaction.message.id);
	}, error => console.log( '- ' + error ) );
}

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {String[]} gameGrid
 * @param {0|1} isBig
 * @param {Number} fieldClicked
 * @param {Number} numberRolled
 * @param {gamePlayer} gamePlayer
 * @param {Object[]} players
 * @param {Number} players.index
 * @param {String} players.id
 * @param {emojiPlayerColor} players.emoji
 * @param {String} currentPlayer
 * @param {String} winnerText
 */
function dontgetangry_movePiece(interaction, gameGrid, isBig, fieldClicked, numberRolled, gamePlayer, players, currentPlayer, winnerText = '') {
	let isCPU = botPlayers.has(currentPlayer);
	if ( isCPU ) botPlayedGames.add(interaction.message.id);
	let text = '**Mensch ärgere Dich nicht**\n' + interaction.message.content.split('\n')[1];
	let allowedMentions = {parse: []};
	let components = [];
	if ( numberRolled === 6 && gamePlayer.home.some( fieldPos => gameGrid[fieldPos] === emojiNumberList[fieldClicked] ) ) {
		let newPos = gamePlayer.path[0];
		if ( gameGrid[newPos] !== gameBoard[isBig][newPos] ) {
			let kickedPos = gamePlayers[isBig][gameGrid[newPos]].home.find( fieldPos => gameGrid[fieldPos] === gameBoard[isBig][fieldPos] );
			gameGrid[kickedPos] = gameGrid[newPos];
			let kickedPlayer = players.find( player => player.emoji === gameGrid[newPos] )?.id;
			if ( interaction.guild?.members?.cache.has(kickedPlayer) ) {
				text = text.replace( '**Mensch ', '**' + interaction.guild.members.cache.get(kickedPlayer).displayName.replace( /@/g, '@\u200b' ).replace( /\)/g, '\\)' ) + ' ' );
			}
			else if ( interaction.client.users.cache.has(kickedPlayer) ) {
				text = text.replace( '**Mensch ', '**' + interaction.client.users.cache.get(kickedPlayer).username.replace( /@/g, '@\u200b' ).replace( /\)/g, '\\)' ) + ' ' );
			}
		}
		let curPos = gamePlayer.home.find( fieldPos => gameGrid[fieldPos] === emojiNumberList[fieldClicked] );
		gameGrid[curPos] = emojiLastMove;
		gameGrid[newPos] = gamePlayer.emoji;
	}
	else {
		let curPos = gamePlayer.path.find( fieldPos => gameGrid[fieldPos] === emojiNumberList[fieldClicked] );
		let newPos = gamePlayer.path[gamePlayer.path.indexOf(curPos) + numberRolled];
		if ( gameGrid[newPos] !== gameBoard[isBig][newPos] ) {
			let kickedPos = gamePlayers[isBig][gameGrid[newPos]].home.find( fieldPos => gameGrid[fieldPos] === gameBoard[isBig][fieldPos] );
			gameGrid[kickedPos] = gameGrid[newPos];
			let kickedPlayer = players.find( player => player.emoji === gameGrid[newPos] )?.id;
			if ( interaction.guild?.members?.cache.has(kickedPlayer) ) {
				text = text.replace( '**Mensch ', '**' + interaction.guild.members.cache.get(kickedPlayer).displayName.replace( /@/g, '@\u200b' ).replace( /\)/g, '\\)' ) + ' ' );
			}
			else if ( interaction.client.users.cache.has(kickedPlayer) ) {
				text = text.replace( '**Mensch ', '**' + interaction.client.users.cache.get(kickedPlayer).username.replace( /@/g, '@\u200b' ).replace( /\)/g, '\\)' ) + ' ' );
			}
		}
		gameGrid[curPos] = emojiLastMove;
		gameGrid[newPos] = gamePlayer.emoji;
	}
	let moveTurn = true;
	if ( gamePlayer.target.every( targetPos => ( gameGrid[targetPos] !== gameBoard[isBig][targetPos] && gameGrid[targetPos] !== emojiLastMove ) ) ) {
		if ( !winnerText ) winnerText = `\n\n${emojiMedalList[0]} <@${currentPlayer}> (${gamePlayer.emoji})`;
		else winnerText += `\n${emojiMedalList[winnerText.split('\n').length - 2]} <@${currentPlayer}> (${gamePlayer.emoji})`;
		let activePlayers = players.filter( player => !gamePlayers[isBig][player.emoji].target.every( targetPos => {
			return ( gameGrid[targetPos] !== gameBoard[isBig][targetPos] && gameGrid[targetPos] !== emojiLastMove );
		} ) );
		if ( activePlayers.length < 2 || activePlayers.every( player => botPlayers.has(player.id) ) ) {
			moveTurn = false;
			gameGrid[gameGrid.indexOf(emojiLastMove)] = gameBoard[isBig][gameGrid.indexOf(emojiLastMove)];
			if ( interaction.channelId === '878593019119546379' && interaction.message.hasThread ) {
				interaction.message.thread?.setAutoArchiveDuration(ThreadAutoArchiveDuration.OneHour, 'Spiel ist zuende.').catch( error => console.log( '- ' + error ) );
			}
		}
	}
	else if ( numberRolled === 6 ) {
		moveTurn = false;
		allowedMentions = {users: [currentPlayer]};
		let button = new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('dontgetangry_die').setEmoji('🎲');
		if ( isGermanGuild(interaction) ) {
			text += `\n${( isCPU ? '🤖 ' : '' )}<@${currentPlayer}> (${gamePlayer.emoji}) ist immer noch am Zug.`;
			button.setLabel('Würfel.');
		}
		else {
			text += `\nIt's still ${( isCPU ? '🤖 ' : '' )}<@${currentPlayer}> (${gamePlayer.emoji}) turn.`;
			button.setLabel('Roll the dice.');
		}
		components.push(new ActionRowBuilder().addComponents(button));
	}
	else if ( players.filter( player => !gamePlayers[isBig][player.emoji].target.every( targetPos => {
		return ( gameGrid[targetPos] !== gameBoard[isBig][targetPos] && gameGrid[targetPos] !== emojiLastMove );
	} ) ).every( player => botPlayers.has(player.id) ) ) {
		moveTurn = false;
		gameGrid[gameGrid.indexOf(emojiLastMove)] = gameBoard[isBig][gameGrid.indexOf(emojiLastMove)];
		if ( interaction.channelId === '878593019119546379' && interaction.message.hasThread ) {
			interaction.message.thread?.setAutoArchiveDuration(ThreadAutoArchiveDuration.OneHour, 'Spiel ist zuende.').catch( error => console.log( '- ' + error ) );
		}
	}
	let nextPlayer = players.find( player => player.emoji === gamePlayer.emoji );
	if ( moveTurn ) {
		let i = 0;
		nextPlayer = ( players[nextPlayer.index + 1] || players[0] );
		while ( gamePlayers[isBig][nextPlayer.emoji].target.every( targetPos => gameGrid[targetPos] === nextPlayer.emoji ) ) {
			nextPlayer = ( players[nextPlayer.index + 1] || players[0] );
			if ( i++ > 6 ) break;
		}
		isCPU = botPlayers.has(nextPlayer.id);
		allowedMentions = {users: [nextPlayer.id]};
		let buttons = [
			new ButtonBuilder().setStyle(ButtonStyle.Primary).setCustomId('dontgetangry_die').setEmoji('🎲'),
			new ButtonBuilder().setStyle(ButtonStyle.Danger).setCustomId('dontgetangry_giveup').setEmoji('☠️')
		];
		if ( isGermanGuild(interaction) ) {
			text += `\n${( isCPU ? '🤖 ' : '' )}<@${nextPlayer.id}> (${nextPlayer.emoji}) ist am Zug.`;
			buttons[0].setLabel('Würfel.');
			buttons[1].setLabel('Aufgeben?');
		}
		else {
			text += `\nIt's ${( isCPU ? '🤖 ' : '' )}<@${nextPlayer.id}> (${nextPlayer.emoji}) turn.`;
			buttons[0].setLabel('Roll the dice.');
			buttons[1].setLabel('Give up?');
		}
		if ( isCPU ) {
			buttons.pop();
			botPlayedGames.add(interaction.message.id);
		}
		components.push(new ActionRowBuilder().addComponents(...buttons));
	}
	let message = {
		content: text + winnerText + '\n\n' + gameGrid.join('').replace( /1️⃣|2️⃣|3️⃣|4️⃣/g, gamePlayer.emoji ),
		allowedMentions, components,
		fetchReply: isCPU && components.length
	};
	return ( interaction.replied ? interaction.editReply( message ) : interaction.update( message ) ).then( msg => {
		if ( isCPU && components.length ) {
			if ( msg ) interaction.message = msg;
			let nextGameGrid = [...gameGrid.join('').replace( /1️⃣|2️⃣|3️⃣|4️⃣/g, gamePlayer.emoji )];
			if ( nextGameGrid.includes( emojiLastMove ) ) nextGameGrid[nextGameGrid.indexOf(emojiLastMove)] = gameBoard[isBig][nextGameGrid.indexOf(emojiLastMove)];
			let nextGamePlayer = gamePlayers[isBig][nextPlayer.emoji];
			setTimeout( dontgetangry_rollDice, 3000, interaction, nextGameGrid, isBig, nextGamePlayer, players, nextPlayer.id, winnerText );
		}
		else botPlayedGames.delete(interaction.message.id);
	}, error => console.log( '- ' + error ) );
}

export default {
	slash: dontgetangry_slash,
	join: dontgetangry_join,
	button: dontgetangry_button
};
