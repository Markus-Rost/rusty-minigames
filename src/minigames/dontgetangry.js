import { ApplicationCommandOptionType, ButtonStyle, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { emojiNumberList, emojiMedalList, botPlayers, botPlayedGames, getCommandOption, getCommandUserOption, getMessage, buildActionRow, buildButton, updateMessage } from '../util.js';

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
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction
 * @returns {import('discord-api-types/v10').APIInteractionResponseChannelMessageWithSource}
 */
function dontgetangry_slash(interaction) {
	/** @type {{id: String, color: emojiPlayerColor}[]} */
	let playerUsers = [
		interaction.user,
		getCommandUserOption(interaction, 'player2'),
		getCommandUserOption(interaction, 'player3'),
		getCommandUserOption(interaction, 'player4'),
		getCommandUserOption(interaction, 'player5'),
		getCommandUserOption(interaction, 'player6')
	].filter( playerUser => playerUser && ( !playerUser.bot || botPlayers.has(playerUser.id) ) ).map( playerUser => {
		return {
			id: playerUser.id,
			color: null
		};
	} );
	if ( playerUsers.length < ( ( interaction.data.options?.filter( option => option.type === ApplicationCommandOptionType.User ).length ?? 0 ) + 1 ) ) {
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: getMessage(interaction.locale, 'error_unknown_bots'),
				flags: MessageFlags.Ephemeral,
				allowed_mentions: {
					parse: []
				}
			}
		};
	}
	let isBig = ( playerUsers.length > 4 ? 1 : 0 );
	let gameGrid = gameBoard[isBig].slice();
	let text = '**' + getMessage(interaction.guild_locale, 'dontgetangry') + '**\n';
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
	let components = [ buildActionRow(
		buildButton('dontgetangry_die', ButtonStyle.Primary, '🎲', getMessage(interaction.guild_locale, 'dontgetangry_die')),
		( playerUsers.length === 3 ?
			buildButton('dontgetangry_big', ButtonStyle.Danger, '♻️', getMessage(interaction.guild_locale, 'dontgetangry_big'))
		: null )
	) ];
	let startingPlayer = playerUsers[1];
	while ( botPlayers.has(startingPlayer.id) ) {
		startingPlayer = playerUsers[playerUsers.indexOf(startingPlayer) + 1];
		if ( !startingPlayer ) {
			startingPlayer = playerUsers[0];
			break;
		}
	}
	if ( getCommandOption(interaction, 'allow-join')?.value ) {
		startingPlayer = playerUsers[0];
		components.push( buildActionRow(
			buildButton('dontgetangry_join', ButtonStyle.Success, '🆕', getMessage(interaction.guild_locale, 'dontgetangry_join'))
		) );
	}
	text += '\n' + getMessage(interaction.guild_locale, 'game_turn', `<@${startingPlayer.id}> (${startingPlayer.color})`);
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: text + '\n\n' + gameGrid.join(''),
			allowed_mentions: {
				users: [...new Set(playerUsers.map( playerUser => playerUser.id ))]
			},
			components
		}
	};
}

/**
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction
 * @param {String[]} playerList
 * @returns {import('discord-api-types/v10').APIInteractionResponseUpdateMessage|import('discord-api-types/v10').APIInteractionResponseChannelMessageWithSource}
 */
function dontgetangry_join(interaction, ...playerList) {
	let text = interaction.message.content.split('\n');
	let gameGrid = [...text.splice(-11).join('\n')];
	let isBig = ( gameGrid.length > 150 ? 1 : 0 );
	playerList = playerList.filter( player => player ).slice(0, -1);
	if ( playerList.length >= 6 ) return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: getMessage(interaction.locale, 'dontgetangry_join_full'),
			flags: MessageFlags.Ephemeral,
			allowed_mentions: {
				parse: []
			}
		}
	};
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
		buildActionRow(
			buildButton('dontgetangry_die', ButtonStyle.Primary, '🎲', getMessage(interaction.guild_locale, 'dontgetangry_die')),
			( players.length === 3 ?
				buildButton('dontgetangry_big', ButtonStyle.Danger, '♻️', getMessage(interaction.guild_locale, 'dontgetangry_big'))
			: null )
		),
		buildActionRow(
			buildButton('dontgetangry_join', ButtonStyle.Success, '🆕', getMessage(interaction.guild_locale, 'dontgetangry_join'), players.length === 6)
		)
	];
	return {
		type: InteractionResponseType.UpdateMessage,
		data: {
			content: text.join('\n') + '\n' + gameGrid.join(''),
			allowed_mentions: {
				users: [playerList[0]]
			},
			components
		}
	};
}

/**
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction
 * @param {String[]} playerList
 * @returns {import('discord-api-types/v10').APIInteractionResponseUpdateMessage|import('discord-api-types/v10').APIInteractionResponseChannelMessageWithSource}
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
	if ( interaction.data.custom_id === 'dontgetangry_big' ) {
		let gameGrid = gameBoard[1].slice();
		let text = '**' + getMessage(interaction.guild_locale, 'dontgetangry') + '**\n';
		text += `<@${player1}> (${emojiPlayerColors[0]}) vs. <@${player2}> (${emojiPlayerColors[2]}) vs. <@${player3}> (${emojiPlayerColors[4]})`;
		gamePlayers[1][emojiPlayerColors[0]].home.forEach( fieldPos => gameGrid[fieldPos] = emojiPlayerColors[0] );
		gamePlayers[1][emojiPlayerColors[2]].home.forEach( fieldPos => gameGrid[fieldPos] = emojiPlayerColors[2] );
		gamePlayers[1][emojiPlayerColors[4]].home.forEach( fieldPos => gameGrid[fieldPos] = emojiPlayerColors[4] );
		let startingPlayer = `<@${currentPlayer}> `;
		if ( currentPlayer === player1 ) startingPlayer += `(${emojiPlayerColors[0]})`;
		else if ( currentPlayer === player2 ) startingPlayer += `(${emojiPlayerColors[2]})`;
		else if ( currentPlayer === player3 ) startingPlayer += `(${emojiPlayerColors[3]})`;
		text += '\n' + getMessage(interaction.guild_locale, 'game_turn', startingPlayer);
		let components = [ buildActionRow(
			buildButton('dontgetangry_die', ButtonStyle.Primary, '🎲', getMessage(interaction.guild_locale, 'dontgetangry_die'))
		) ];
		if ( interaction.message.components[1] ) components.push( buildActionRow(
			buildButton('dontgetangry_join', ButtonStyle.Success, '🆕', getMessage(interaction.guild_locale, 'dontgetangry_join'))
		) );
		return {
			type: InteractionResponseType.UpdateMessage,
			data: {
				content: text + '\n\n' + gameGrid.join(''),
				allowed_mentions: {
					users: [currentPlayer]
				},
				components
			}
		};
	}
	if ( botPlayers.has(interaction.user.id) ) return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: '🤖 ' + getMessage(interaction.locale, 'imabot_playing'),
			components: [ buildActionRow(
				buildButton('imabot', ButtonStyle.Success, '🤖', 'imabot')
			) ],
			flags: MessageFlags.Ephemeral,
			allowed_mentions: {
				parse: []
			}
		}
	};
	if ( interaction.user.id !== currentPlayer ) return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: getMessage(interaction.locale, 'error_not_your_turn'),
			flags: MessageFlags.Ephemeral,
			allowed_mentions: {
				parse: []
			}
		}
	};
	if ( botPlayedGames.has(interaction.message.id) ) return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: '🤖 ' + getMessage(interaction.locale, 'imabot_wait'),
			flags: MessageFlags.Ephemeral,
			allowed_mentions: {
				parse: []
			}
		}
	};
	if ( interaction.data.custom_id === 'dontgetangry_giveup' ) return {
		type: InteractionResponseType.UpdateMessage,
		data: {
			components: [ buildActionRow(
				buildButton('dontgetangry_giveup_yes', ButtonStyle.Danger, '☠️', getMessage(interaction.guild_locale, 'dontgetangry_giveup_yes')),
				buildButton('dontgetangry_giveup_no', ButtonStyle.Success, '↪️', getMessage(interaction.guild_locale, 'dontgetangry_giveup_no'))
			) ],
			allowed_mentions: {
				users: [currentPlayer]
			}
		}
	};
	if ( interaction.data.custom_id === 'dontgetangry_giveup_no' ) return {
		type: InteractionResponseType.UpdateMessage,
		data: {
			components: [ buildActionRow(
				buildButton('dontgetangry_die', ButtonStyle.Primary, '🎲', getMessage(interaction.guild_locale, 'dontgetangry_die')),
				buildButton('dontgetangry_giveup', ButtonStyle.Danger, '☠️', getMessage(interaction.guild_locale, 'dontgetangry_giveup'))
			) ],
			allowed_mentions: {
				users: [currentPlayer]
			}
		}
	};
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
	if ( interaction.data.custom_id === 'dontgetangry_giveup_yes' ) {
		let text = '**' + getMessage(interaction.guild_locale, 'dontgetangry') + '**\n';
		text += interaction.message.content.split('\n')[1].replace( `<@${currentPlayer}> (${gamePlayer.emoji})`, `~~*<@${currentPlayer}>* (${gamePlayer.emoji})~~` );
		while ( gameGrid.includes( gamePlayer.emoji ) ) {
			let i = gameGrid.indexOf(gamePlayer.emoji);
			gameGrid[i] = gameBoard[isBig][i];
		}
		gamePlayer.target.forEach( targetPos => gameGrid[targetPos] = gamePlayer.emoji );
		let activePlayers = players.filter( player => !gamePlayers[isBig][player.emoji].target.every( targetPos => {
			return ( gameGrid[targetPos] !== gameBoard[isBig][targetPos] );
		} ) );
		if ( activePlayers.length < 2 || activePlayers.every( player => botPlayers.has(player.id) ) ) return {
			type: InteractionResponseType.UpdateMessage,
			data: {
				content: text + winnerText + '\n\n' + gameGrid.join(''),
				components: [],
				allowed_mentions: {
					parse: []
				}
			}
		};
		let nextPlayer = players.find( player => player.emoji === gamePlayer.emoji );
		let i = 0;
		nextPlayer = ( players[nextPlayer.index + 1] || players[0] );
		while ( gamePlayers[isBig][nextPlayer.emoji].target.every( targetPos => gameGrid[targetPos] === nextPlayer.emoji ) ) {
			nextPlayer = ( players[nextPlayer.index + 1] || players[0] );
			if ( i++ > 6 ) break;
		}
		let isCPU = botPlayers.has(nextPlayer.id);
		text += '\n' + getMessage(interaction.guild_locale, 'game_turn', ( isCPU ? '🤖 ' : '' ) + `<@${nextPlayer.id}> (${nextPlayer.emoji})`);
		if ( isCPU ) {
			botPlayedGames.add(interaction.message.id);
			let nextGamePlayer = gamePlayers[isBig][nextPlayer.emoji];
			dontgetangry_next( dontgetangry_rollDice, interaction, gameGrid.slice(), isBig, 0, nextGamePlayer, players, nextPlayer.id, winnerText );
		}
		return {
			type: InteractionResponseType.UpdateMessage,
			data: {
				content: text + winnerText + '\n\n' + gameGrid.join(''),
				components: [ buildActionRow(
					buildButton('dontgetangry_die', ButtonStyle.Primary, '🎲', getMessage(interaction.guild_locale, 'dontgetangry_die')),
					( isCPU ? null : buildButton('dontgetangry_giveup', ButtonStyle.Danger, '☠️', getMessage(interaction.guild_locale, 'dontgetangry_giveup')) )
				) ],
				allowed_mentions: {
					users: [nextPlayer.id]
				}
			}
		};
	}
	if ( interaction.data.custom_id === 'dontgetangry_die' ) {
		let currentTry = +( interaction.message.content.match(/\*\*([1-3])(\.|st|nd|rd)\*\*/)?.[1] || 0 );
		return {
			type: InteractionResponseType.UpdateMessage,
			data: dontgetangry_rollDice(interaction, gameGrid, isBig, currentTry, gamePlayer, players, currentPlayer, winnerText)
		};
	}
	let fieldClicked = +interaction.data.custom_id.replace( 'dontgetangry_', '' );
	let numberRolled = +interaction.message.content.match(/\*\*([1-6])\*\*/)[1];
	return {
		type: InteractionResponseType.UpdateMessage,
		data: dontgetangry_movePiece(interaction, gameGrid, isBig, fieldClicked, numberRolled, gamePlayer, players, currentPlayer, winnerText)
	};
}

/**
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction
 * @param {String[]} gameGrid
 * @param {0|1} isBig
 * @param {Number} currentTry
 * @param {gamePlayer} gamePlayer
 * @param {Object[]} players
 * @param {Number} players.index
 * @param {String} players.id
 * @param {emojiPlayerColor} players.emoji
 * @param {String} currentPlayer
 * @param {String} winnerText
 * @returns {import('discord-api-types/v10').APIInteractionResponseCallbackData}
 */
function dontgetangry_rollDice(interaction, gameGrid, isBig, currentTry, gamePlayer, players, currentPlayer, winnerText = '') {
	let isCPU = botPlayers.has(currentPlayer);
	if ( isCPU ) botPlayedGames.add(interaction.message.id);
	let numberRolled = Math.floor(Math.random() * 6) + 1;
	let text = '**' + getMessage(interaction.guild_locale, 'dontgetangry') + '**\n';
	text += interaction.message.content.split('\n')[1];
	/** @type {import('discord-api-types/v10').APIActionRowComponent<import('discord-api-types/v10').APIButtonComponentWithCustomId>[]} */
	let components = [];
	let inHome = gamePlayer.home.filter( fieldPos => gameGrid[fieldPos] === gamePlayer.emoji ).length;
	let inTarget = +( gameGrid[gamePlayer.target[3]] === gamePlayer.emoji );
	if ( inTarget ) inTarget += +( gameGrid[gamePlayer.target[2]] === gamePlayer.emoji );
	if ( inTarget === 2 ) inTarget += +( gameGrid[gamePlayer.target[1]] === gamePlayer.emoji );
	if ( ( inHome + inTarget ) === 4 ) currentTry++;
	let fieldClickedCPU = -1;
	if ( currentTry && numberRolled !== 6 ) components.push( buildActionRow(
		buildButton('dontgetangry_die', ButtonStyle.Primary, '🎲', getMessage(interaction.guild_locale, 'dontgetangry_die'), currentTry >= 3)
	) );
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
		components.push( buildActionRow( ...playerPos.map( (posInfo, i) => {
			gameGrid[posInfo.pos] = emojiNumberList[i];
			return buildButton('dontgetangry_' + i, ButtonStyle.Primary, emojiNumberList[i], null, posInfo.disabled);
		} ) ) );
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
	text += getMessage(interaction.guild_locale, 'dontgetangry_roll', ( isCPU ? '🤖 ' : '' ) + `<@${currentPlayer}> (${gamePlayer.emoji})`, `**${numberRolled}**`);
	if ( currentTry ) {
		if ( interaction.guild_locale === 'de' ) text += getMessage(interaction.guild_locale, 'dontgetangry_roll_try', `**${currentTry}.**`);
		else if ( currentTry === 1 ) text += getMessage(interaction.guild_locale, 'dontgetangry_roll_try', `**${currentTry}st**`);
		else if ( currentTry === 2 ) text += getMessage(interaction.guild_locale, 'dontgetangry_roll_try', `**${currentTry}nd**`);
		else if ( currentTry === 3 ) text += getMessage(interaction.guild_locale, 'dontgetangry_roll_try', `**${currentTry}rd**`);
		else text += getMessage(interaction.guild_locale, 'dontgetangry_roll_try', `**${currentTry}.**`);
	}
	if ( components.every( component => component.disabled ) ) {
		dontgetangry_next( dontgetangry_moveBlocked, interaction, gameGrid.slice(), isBig, numberRolled, currentTry, gamePlayer, players, currentPlayer, winnerText );
	}
	else if ( isCPU ) {
		if ( fieldClickedCPU === -1 ) dontgetangry_next( dontgetangry_rollDice, interaction, gameGrid.slice(), isBig, currentTry, gamePlayer, players, currentPlayer, winnerText );
		else dontgetangry_next( dontgetangry_movePiece, interaction, gameGrid.slice(), isBig, fieldClickedCPU, numberRolled, gamePlayer, players, currentPlayer, winnerText );
	}
	else botPlayedGames.delete(interaction.message.id);
	return {
		content: text + winnerText + '\n\n' + gameGrid.join(''),
		allowed_mentions: {
			users: [currentPlayer]
		},
		components
	};
}

/**
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction
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
 * @returns {import('discord-api-types/v10').APIInteractionResponseCallbackData}
 */
function dontgetangry_movePiece(interaction, gameGrid, isBig, fieldClicked, numberRolled, gamePlayer, players, currentPlayer, winnerText = '') {
	let isCPU = botPlayers.has(currentPlayer);
	if ( isCPU ) botPlayedGames.add(interaction.message.id);
	let text = '**' + getMessage(interaction.guild_locale, 'dontgetangry') + '**\n';
	text += interaction.message.content.split('\n')[1];
	/** @type {import('discord-api-types/v10').APIAllowedMentions} */
	let allowed_mentions = {parse: []};
	/** @type {import('discord-api-types/v10').APIActionRowComponent<import('discord-api-types/v10').APIButtonComponentWithCustomId>[]} */
	let components = [];
	if ( numberRolled === 6 && gamePlayer.home.some( fieldPos => gameGrid[fieldPos] === emojiNumberList[fieldClicked] ) ) {
		let newPos = gamePlayer.path[0];
		if ( gameGrid[newPos] !== gameBoard[isBig][newPos] ) {
			let kickedPos = gamePlayers[isBig][gameGrid[newPos]].home.find( fieldPos => gameGrid[fieldPos] === gameBoard[isBig][fieldPos] );
			gameGrid[kickedPos] = gameGrid[newPos];
			/*
			let kickedPlayer = players.find( player => player.emoji === gameGrid[newPos] )?.id;
			if ( interaction.guild?.members?.cache.has(kickedPlayer) ) {
				text = text.replace( '**Mensch ', '**' + interaction.guild.members.cache.get(kickedPlayer).displayName.replace( /@/g, '@\u200b' ).replace( /\)/g, '\\)' ) + ' ' );
			}
			else if ( interaction.client.users.cache.has(kickedPlayer) ) {
				text = text.replace( '**Mensch ', '**' + interaction.client.users.cache.get(kickedPlayer).username.replace( /@/g, '@\u200b' ).replace( /\)/g, '\\)' ) + ' ' );
			}
			*/
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
			/*
			let kickedPlayer = players.find( player => player.emoji === gameGrid[newPos] )?.id;
			if ( interaction.guild?.members?.cache.has(kickedPlayer) ) {
				text = text.replace( '**Mensch ', '**' + interaction.guild.members.cache.get(kickedPlayer).displayName.replace( /@/g, '@\u200b' ).replace( /\)/g, '\\)' ) + ' ' );
			}
			else if ( interaction.client.users.cache.has(kickedPlayer) ) {
				text = text.replace( '**Mensch ', '**' + interaction.client.users.cache.get(kickedPlayer).username.replace( /@/g, '@\u200b' ).replace( /\)/g, '\\)' ) + ' ' );
			}
			*/
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
		}
	}
	else if ( numberRolled === 6 ) {
		moveTurn = false;
		allowed_mentions.users = [currentPlayer];
		text += '\n' + getMessage(interaction.guild_locale, 'dontgetangry_turn', ( isCPU ? '🤖 ' : '' ) + `<@${currentPlayer}> (${gamePlayer.emoji})`);
		components.push( buildActionRow(
			buildButton('dontgetangry_die', ButtonStyle.Primary, '🎲', getMessage(interaction.guild_locale, 'dontgetangry_die'))
		) );
	}
	else if ( players.filter( player => !gamePlayers[isBig][player.emoji].target.every( targetPos => {
		return ( gameGrid[targetPos] !== gameBoard[isBig][targetPos] && gameGrid[targetPos] !== emojiLastMove );
	} ) ).every( player => botPlayers.has(player.id) ) ) {
		moveTurn = false;
		gameGrid[gameGrid.indexOf(emojiLastMove)] = gameBoard[isBig][gameGrid.indexOf(emojiLastMove)];
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
		allowed_mentions.users = [nextPlayer.id];
		text += '\n' + getMessage(interaction.guild_locale, 'game_turn', ( isCPU ? '🤖 ' : '' ) + `<@${nextPlayer.id}> (${nextPlayer.emoji})`);
		components.push( buildActionRow(
			buildButton('dontgetangry_die', ButtonStyle.Primary, '🎲', getMessage(interaction.guild_locale, 'dontgetangry_die')),
			( isCPU ? null : buildButton('dontgetangry_giveup', ButtonStyle.Danger, '☠️', getMessage(interaction.guild_locale, 'dontgetangry_giveup')) )
		) );
		if ( isCPU ) botPlayedGames.add(interaction.message.id);
	}
	if ( gameGrid.includes( emojiNumberList[0] ) ) gameGrid[gameGrid.indexOf(emojiNumberList[0])] = gamePlayer.emoji;
	if ( gameGrid.includes( emojiNumberList[1] ) ) gameGrid[gameGrid.indexOf(emojiNumberList[1])] = gamePlayer.emoji;
	if ( gameGrid.includes( emojiNumberList[2] ) ) gameGrid[gameGrid.indexOf(emojiNumberList[2])] = gamePlayer.emoji;
	if ( gameGrid.includes( emojiNumberList[3] ) ) gameGrid[gameGrid.indexOf(emojiNumberList[3])] = gamePlayer.emoji;
	if ( isCPU && components.length ) {
		let nextGameGrid = gameGrid.slice();
		if ( nextGameGrid.includes( emojiLastMove ) ) nextGameGrid[nextGameGrid.indexOf(emojiLastMove)] = gameBoard[isBig][nextGameGrid.indexOf(emojiLastMove)];
		let nextGamePlayer = gamePlayers[isBig][nextPlayer.emoji];
		dontgetangry_next( dontgetangry_rollDice, interaction, nextGameGrid, isBig, 0, nextGamePlayer, players, nextPlayer.id, winnerText );
	}
	else botPlayedGames.delete(interaction.message.id);
	return {
		content: text + winnerText + '\n\n' + gameGrid.join(''),
		components, allowed_mentions
	};
}

/**
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction
 * @param {String[]} gameGrid
 * @param {0|1} isBig
 * @param {Number} numberRolled
 * @param {Number} currentTry
 * @param {gamePlayer} gamePlayer
 * @param {Object[]} players
 * @param {Number} players.index
 * @param {String} players.id
 * @param {emojiPlayerColor} players.emoji
 * @param {String} currentPlayer
 * @param {String} winnerText
 * @returns {import('discord-api-types/v10').APIInteractionResponseCallbackData}
 */
function dontgetangry_moveBlocked(interaction, gameGrid, isBig, numberRolled, currentTry, gamePlayer, players, currentPlayer, winnerText = '') {
	let isCPU = botPlayers.has(currentPlayer);
	if ( isCPU ) botPlayedGames.add(interaction.message.id);
	let text = '**' + getMessage(interaction.guild_locale, 'dontgetangry') + '**\n';
	text += interaction.message.content.split('\n')[1];
	/** @type {import('discord-api-types/v10').APIAllowedMentions} */
	let allowed_mentions = {parse: []};
	/** @type {import('discord-api-types/v10').APIActionRowComponent<import('discord-api-types/v10').APIButtonComponentWithCustomId>[]} */
	let components = [];
	let nextPlayer = players.find( player => player.emoji === gamePlayer.emoji );
	if ( numberRolled === 6 ) {
		allowed_mentions.users = [currentPlayer];
		text += '\n' + getMessage(interaction.guild_locale, 'dontgetangry_turn', ( isCPU ? '🤖 ' : '' ) + `<@${currentPlayer}> (${gamePlayer.emoji})`);
		components.push( buildActionRow(
			buildButton('dontgetangry_die', ButtonStyle.Primary, '🎲', getMessage(interaction.guild_locale, 'dontgetangry_die'))
		) );
	}
	else if ( players.filter( player => !gamePlayers[isBig][player.emoji].target.every( targetPos => {
		return ( gameGrid[targetPos] !== gameBoard[isBig][targetPos] && gameGrid[targetPos] !== emojiLastMove );
	} ) ).every( player => botPlayers.has(player.id) ) ) {
		components = [];
		gameGrid[gameGrid.indexOf(emojiLastMove)] = gameBoard[isBig][gameGrid.indexOf(emojiLastMove)];
	}
	else {
		let i = 0;
		nextPlayer = ( players[nextPlayer.index + 1] || players[0] );
		while ( gamePlayers[isBig][nextPlayer.emoji].target.every( targetPos => gameGrid[targetPos] === nextPlayer.emoji ) ) {
			nextPlayer = ( players[nextPlayer.index + 1] || players[0] );
			if ( i++ > 6 ) break;
		}
		isCPU = botPlayers.has(nextPlayer.id);
		allowed_mentions.users = [nextPlayer.id];
		text += '\n' + getMessage(interaction.guild_locale, 'game_turn', ( isCPU ? '🤖 ' : '' ) + `<@${nextPlayer.id}> (${nextPlayer.emoji})`);
		components.push( buildActionRow(
			buildButton('dontgetangry_die', ButtonStyle.Primary, '🎲', getMessage(interaction.guild_locale, 'dontgetangry_die')),
			( isCPU ? null : buildButton('dontgetangry_giveup', ButtonStyle.Danger, '☠️', getMessage(interaction.guild_locale, 'dontgetangry_giveup')) )
		) );
		if ( isCPU ) botPlayedGames.add(interaction.message.id);
	}
	if ( gameGrid.includes( emojiNumberList[0] ) ) gameGrid[gameGrid.indexOf(emojiNumberList[0])] = gamePlayer.emoji;
	if ( gameGrid.includes( emojiNumberList[1] ) ) gameGrid[gameGrid.indexOf(emojiNumberList[1])] = gamePlayer.emoji;
	if ( gameGrid.includes( emojiNumberList[2] ) ) gameGrid[gameGrid.indexOf(emojiNumberList[2])] = gamePlayer.emoji;
	if ( gameGrid.includes( emojiNumberList[3] ) ) gameGrid[gameGrid.indexOf(emojiNumberList[3])] = gamePlayer.emoji;
	if ( isCPU && components.length ) {
		let nextGameGrid = gameGrid.slice();
		if ( nextGameGrid.includes( emojiLastMove ) ) nextGameGrid[nextGameGrid.indexOf(emojiLastMove)] = gameBoard[isBig][nextGameGrid.indexOf(emojiLastMove)];
		let nextGamePlayer = gamePlayers[isBig][nextPlayer.emoji];
		dontgetangry_next( dontgetangry_rollDice, interaction, nextGameGrid, isBig, currentTry, nextGamePlayer, players, nextPlayer.id, winnerText );
	}
	else botPlayedGames.delete(interaction.message.id);
	return {
		content: text + winnerText + '\n\n' + gameGrid.join(''),
		components, allowed_mentions
	}
}

/**
 * @callback dontgetangryFunction
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction
 * @param {...any} args
 * @returns {import('discord-api-types/v10').APIInteractionResponseCallbackData}
 */

/**
 * @param {dontgetangryFunction} nextFunction 
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction 
 * @param {...any} args 
 */
function dontgetangry_next(nextFunction, interaction, ...args) {
	setTimeout( () => {
		updateMessage(interaction, nextFunction(interaction, ...args));
	}, 3000);
}

export default {
	slash: dontgetangry_slash,
	join: dontgetangry_join,
	button: dontgetangry_button
};
