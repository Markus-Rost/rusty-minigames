import { ButtonStyle, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { buildActionRow, buildButton, emojiNumberList, getCommandUserOption, getMessage } from '../util.js';

// /eval code:updateApplicationCommand('chess')

const gameBoard = [
	'br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br',
	'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp',
	'', '', '', '', '', '', '', '',
	'', '', '', '', '', '', '', '',
	'', '', '', '', '', '', '', '',
	'', '', '', '', '', '', '', '',
	'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp',
	'wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr'
];

const gamePieces = {
	'': ['<:ws:949023786605363201>', '<:bs:949023786647298088>'],
	bp: ['<:bpws:949023786798293072>', '<:bpbs:949023786932531250>'],
	bn: ['<:bnws:949023787058348042>', '<:bnbs:949023786555015249>'],
	bb: ['<:bbws:949023786685046854>', '<:bbbs:949023786529857616>'],
	br: ['<:brws:949023786596970537>', '<:brbs:949023786571821146>'],
	bq: ['<:bqws:949023786710225006>', '<:bqbs:949023786647289896>'],
	bk: ['<:bkws:949023786555043890>', '<:bkbs:949023786575986758>'],
	wp: ['<:wpws:949023786966069268>', '<:wpbs:949023786869588039>'],
	wn: ['<:wnws:949023786722816070>', '<:wnbs:949023786487935007>'],
	wb: ['<:wbws:949023786697646120>', '<:wbbs:949023786693459988>'],
	wr: ['<:wrws:949023786848641054>', '<:wrbs:949023786714406964>'],
	wq: ['<:wqws:949023786659889175>', '<:wqbs:949023786731188284>'],
	wk: ['<:wkws:949023786844446742>', '<:wkbs:949023786517286943>']
};

/** @type {Map<String, Map<String, Number>>} */
const chessGames = new Map();
const initialUniquePos = gameBoard.join('_') + '_' + [
	'chess_48_o_1111_40_32', 'chess_49_o_1111_41_33', 'chess_50_o_1111_42_34', 'chess_51_o_1111_43_35', // pawn
	'chess_52_o_1111_44_36', 'chess_53_o_1111_45_37', 'chess_54_o_1111_46_38', 'chess_55_o_1111_47_39', // pawn
	'chess_57_o_1111_40_42', 'chess_62_o_1111_45_47', 'chess_58_o_1111', 'chess_61_o_1111', // light
	'chess_56_o_1111', 'chess_63_o_1111', 'chess_59_o_1111', 'chess_60_o_1111' // heavy
].join('_');

/**
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction
 * @returns {import('discord-api-types/v10').APIInteractionResponseChannelMessageWithSource}
 */
function chess_slash(interaction) {
	let opponentUser = getCommandUserOption(interaction, 'opponent');
	if ( opponentUser && ( opponentUser.bot || opponentUser.id === interaction.user.id ) ) return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: getMessage(interaction.locale, 'error_no_bots'),
			flags: MessageFlags.Ephemeral,
			allowed_mentions: {
				parse: []
			}
		}
	};
	let opponent = opponentUser?.id;
	let text = '**' + getMessage(interaction.guild_locale, 'chess') + '**\n';
	/** @type {import('discord-api-types/v10').APIAllowedMentions} */
	let allowed_mentions = {parse: []};
	let components = chess_getPieces(gameBoard, 'w', '11110', interaction.guild_locale);
	if ( opponent ) {
		allowed_mentions.users = [opponent];
		text += getMessage(interaction.guild_locale, 'chess_challenge', `<@${interaction.user.id}>`, `<@${opponent}>`, `<@${opponent}>`);
		components.push( buildActionRow( buildButton('chess_no', ButtonStyle.Danger, null, getMessage(interaction.guild_locale, 'button_decline')) ) );
	}
	else text += getMessage(interaction.guild_locale, 'chess_start', `<@${interaction.user.id}>`);
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: text + '\n\n' + chess_gridToBoard(gameBoard),
			components, allowed_mentions
		}
	};
}

/**
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction
 * @param {String[]} playerList
 * @returns {import('discord-api-types/v10').APIInteractionResponseUpdateMessage|import('discord-api-types/v10').APIInteractionResponseChannelMessageWithSource}
 */
function chess_button(interaction, [player1, player2, currentPlayer]) {
	if ( interaction.data.custom_id === 'chess_no' && interaction.user.id === player2 ) {
		let content = '**' + getMessage(interaction.guild_locale, 'chess') + '**\n';
		content += getMessage(interaction.guild_locale, 'challenge_declined', `<@${player2}>`, `<@${player1}>`);
		return {
			type: InteractionResponseType.UpdateMessage,
			data: {
				content,
				components: [],
				allowed_mentions: {
					parse: []
				}
			}
		};
	}
	if ( !currentPlayer ) {
		currentPlayer = player2;
	}
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
	let gameGrid = interaction.message.content.split('\n\n')[1].replace(/(?<=>)[^<]+/g, '').replace(/<:(\w\w)?[bw]s:\d+>/g, ' $1').slice(1).split(' ');
	if ( interaction.data.custom_id === 'chess_resign' ) {
		let components = interaction.message.components.slice(0, -1);
		components.push( buildActionRow(
			buildButton('chess_resign_yes', ButtonStyle.Danger, '☠️', getMessage(interaction.guild_locale, 'chess_resign_yes')),
			buildButton('chess_resign_no', ButtonStyle.Success, '↪️', getMessage(interaction.guild_locale, 'chess_resign_no'))
		) );
		return {
			type: InteractionResponseType.UpdateMessage,
			data: {
				components,
				allowed_mentions: {
					users: [currentPlayer]
				}
			}
		};
	}
	if ( interaction.data.custom_id === 'chess_resign_no' ) {
		let components = interaction.message.components.slice(0, -1);
		let uniquePos = gameGrid.join('_') + '_' + components.map( row => row.components.map( button => button.custom_id ).join('_') ).join('_').replace( /_([10]{4})\d+/g, '_$1' );
		components.push( buildActionRow(
			buildButton('chess_resign', ButtonStyle.Danger, '☠️', getMessage(interaction.guild_locale, 'chess_resign')),
			( chessGames.get(interaction.message.id)?.get(uniquePos) >= 3 ?
				buildButton('chess_draw_3', ButtonStyle.Danger, '🤝', getMessage(interaction.guild_locale, 'chess_draw_3'))
			: ( components[0].components[0].custom_id?.split('_')[3]?.slice(4) >= 50 ?
				buildButton('chess_draw_50', ButtonStyle.Danger, '🤝', getMessage(interaction.guild_locale, 'chess_draw_50'))
			:
				buildButton('chess_draw', ButtonStyle.Primary, '🤝', getMessage(interaction.guild_locale, 'chess_draw'))
			) )
		) );
		return {
			type: InteractionResponseType.UpdateMessage,
			data: {
				components,
				allowed_mentions: {
					users: [currentPlayer]
				}
			}
		};
	}
	if ( interaction.data.custom_id === 'chess_resign_yes' ) {
		let opponent = ( interaction.user.id === player2 ? player1 : player2 );
		let textParts = interaction.message.content.split('\n');
		textParts[1] = textParts[1].replace( 'vs.', ( opponent === player1 ? '**1–0**' : '**0–1**' ) );
		textParts[2] = getMessage(interaction.guild_locale, 'chess_end_resigned', `<@${opponent}>`, `<@${currentPlayer}>`);
		chessGames.delete(interaction.message.id);
		return {
			type: InteractionResponseType.UpdateMessage,
			data: {
				content: textParts.join('\n'),
				components: [],
				allowed_mentions: {
					parse: []
				}
			}
		};
	}
	if ( interaction.data.custom_id === 'chess_draw' ) {
		let opponent = ( interaction.user.id === player2 ? player1 : player2 );
		let textParts = interaction.message.content.split('\n');
		textParts[2] = getMessage(interaction.guild_locale, 'chess_draw_offer', `<@${opponent}>`, `<@${currentPlayer}>`);
		let components = interaction.message.components.slice(0, -1);
		components.forEach( row => row.components.forEach( button => button.disabled = true ) );
		components.push( buildActionRow(
			buildButton('chess_draw_yes', ButtonStyle.Danger, '🤝', getMessage(interaction.guild_locale, 'chess_draw_yes')),
			buildButton('chess_draw_no', ButtonStyle.Success, '↪️', getMessage(interaction.guild_locale, 'chess_draw_no'))
		) );
		return {
			type: InteractionResponseType.UpdateMessage,
			data: {
				content: textParts.join('\n'),
				components,
				allowed_mentions: {
					users: [opponent]
				}
			}
		};
	}
	if ( interaction.data.custom_id === 'chess_draw_no' ) {
		let opponent = ( interaction.user.id === player2 ? player1 : player2 );
		let textParts = interaction.message.content.split('\n');
		textParts[2] = getMessage(interaction.guild_locale, 'game_turn', `<@${opponent}>`);
		let components = interaction.message.components.slice(0, -1);
		components.forEach( row => row.components.forEach( button => button.disabled = true ) );
		let uniquePos = gameGrid.join('_') + '_' + components.map( row => row.components.map( button => {
			button.disabled = button.custom_id.split('_').length < 5;
			return button.custom_id;
		} ).join('_') ).join('_').replace( /_([10]{4})\d+/g, '_$1' );
		components.push( buildActionRow(
			buildButton('chess_resign', ButtonStyle.Danger, '☠️', getMessage(interaction.guild_locale, 'chess_resign')),
			( chessGames.get(interaction.message.id)?.get(uniquePos) >= 3 ?
				buildButton('chess_draw_3', ButtonStyle.Danger, '🤝', getMessage(interaction.guild_locale, 'chess_draw_3'))
			: ( components[0].components[0].custom_id?.split('_')[3]?.slice(4) >= 50 ?
				buildButton('chess_draw_50', ButtonStyle.Danger, '🤝', getMessage(interaction.guild_locale, 'chess_draw_50'))
			:
				buildButton('chess_draw', ButtonStyle.Primary, '🤝', getMessage(interaction.guild_locale, 'chess_draw'))
			) )
		) );
		return {
			type: InteractionResponseType.UpdateMessage,
			data: {
				content: textParts.join('\n'),
				components,
				allowed_mentions: {
					users: [opponent]
				}
			}
		};
	}
	if ( interaction.data.custom_id === 'chess_draw_yes' ) {
		let textParts = interaction.message.content.split('\n');
		textParts[1] = textParts[1].replace( 'vs.', '**½–½**' );
		textParts[2] = getMessage(interaction.guild_locale, 'chess_end_draw');
		chessGames.delete(interaction.message.id);
		return {
			type: InteractionResponseType.UpdateMessage,
			data: {
				content: textParts.join('\n'),
				components: [],
				allowed_mentions: {
					parse: []
				}
			}
		};
	}
	if ( interaction.data.custom_id === 'chess_draw_50' ) {
		let textParts = interaction.message.content.split('\n');
		textParts[1] = textParts[1].replace( 'vs.', '**½–½**' );
		textParts[2] = getMessage(interaction.guild_locale, 'chess_end_draw_50');
		chessGames.delete(interaction.message.id);
		return {
			type: InteractionResponseType.UpdateMessage,
			data: {
				content: textParts.join('\n'),
				components: [],
				allowed_mentions: {
					parse: []
				}
			}
		};
	}
	if ( interaction.data.custom_id === 'chess_draw_3' ) {
		let textParts = interaction.message.content.split('\n');
		textParts[1] = textParts[1].replace( 'vs.', '**½–½**' );
		textParts[2] = getMessage(interaction.guild_locale, 'chess_end_draw_3');
		chessGames.delete(interaction.message.id);
		return {
			type: InteractionResponseType.UpdateMessage,
			data: {
				content: textParts.join('\n'),
				components: [],
				allowed_mentions: {
					parse: []
				}
			}
		};
	}
	let lastMove = interaction.message.content.split('\n\n')[0].split('\n')[3] ?? '';
	if ( !lastMove ) {
		chessGames.set(interaction.message.id, new Map([['prev', 0], [initialUniquePos, 1]]));
		player2 = player1;
		player1 = currentPlayer;
	}
	let text = '**' + getMessage(interaction.guild_locale, 'chess') + `**\n<@${player1}> (<:wkws:949023786844446742>) vs. <@${player2}> (<:bkbs:949023786575986758>)\n`;
	/** @type {import('discord-api-types/v10').APIAllowedMentions} */
	let allowed_mentions = {parse: []};
	/** @type {import('discord-api-types/v10').APIActionRowComponent<import('discord-api-types/v10').APIButtonComponentWithCustomId>[]} */
	let components = [];
	let [curPos, indicator, castling, ...newPos] = interaction.data.custom_id.split('_').slice(1);
	if ( indicator === 'm' ) {
		let newMove = '';
		if ( curPos === '60' && gameGrid[curPos] === 'wk' ) castling = '00' + castling.slice(2);
		if ( curPos === '56' && gameGrid[curPos] === 'wr' ) castling = '0' + castling.slice(1);
		if ( curPos === '63' && gameGrid[curPos] === 'wr' ) castling = castling[0] + '0' + castling.slice(2);
		if ( curPos === '4' && gameGrid[curPos] === 'bk' ) castling = castling.slice(0, 2) + '00' + castling.slice(4);
		if ( curPos === '0' && gameGrid[curPos] === 'br' ) castling = castling.slice(0, 2) + '0' + castling.slice(3);
		if ( curPos === '7' && gameGrid[curPos] === 'br' ) castling = castling.slice(0, 3) + '0' + castling.slice(4);
		castling = castling.slice(0, 4) + ( gameGrid[curPos].endsWith( 'p' ) || gameGrid[newPos[0]] ? '0' : +castling.slice(4) + 1 );
		if ( !chessGames.has(interaction.message.id) || gameGrid[curPos].endsWith( 'p' ) || gameGrid[newPos[0]] ) chessGames.set(interaction.message.id, new Map([['prev', 0]]));
		let posList = chessGames.get(interaction.message.id);
		if ( ( gameGrid[curPos] === 'wk' || gameGrid[curPos] === 'bk' ) && Math.abs(curPos - newPos[0]) === 2 ) {
			chessGames.set(interaction.message.id, new Map([['prev', 0]]));
			posList = chessGames.get(interaction.message.id);
			if ( curPos === '60' && newPos[0] === '58' ) {
				newMove += '0-0-0';
				gameGrid[59] = 'wr';
				gameGrid[56] = '';
			}
			if ( curPos === '60' && newPos[0] === '62' ) {
				newMove += '0-0';
				gameGrid[61] = 'wr';
				gameGrid[63] = '';
			}
			if ( curPos === '4' && newPos[0] === '2' ) {
				newMove += '0-0-0';
				gameGrid[3] = 'br';
				gameGrid[0] = '';
			}
			if ( curPos === '4' && newPos[0] === '6' ) {
				newMove += '0-0';
				gameGrid[5] = 'br';
				gameGrid[7] = '';
			}
		}
		else {
			newMove += chess_getPosName(gameGrid[curPos], +curPos, interaction.guild_locale) + ( gameGrid[newPos[0]] ? 'x' : '-' ) + chess_getPosName(gameGrid[newPos[0]], +newPos[0], interaction.guild_locale);
			if ( ( gameGrid[curPos] === 'wp' || gameGrid[curPos] === 'bp' ) && curPos % 8 !== newPos[0] % 8 && !gameGrid[newPos[0]] ) {
				newMove = newMove.replace( '-', 'x' ) + ' e.p.';
				if ( curPos % 8 > newPos[0] % 8 ) gameGrid[curPos - 1] = '';
				else gameGrid[+curPos + 1] = '';
			}
		}
		gameGrid[newPos[0]] = gameGrid[curPos];
		gameGrid[curPos] = '';
		if ( gameGrid[newPos[0]] === 'wp' && newPos[0] < 8 ) {
			allowed_mentions.users = [interaction.user.id];
			text += getMessage(interaction.guild_locale, 'game_turn', `<@${interaction.user.id}>`) + '\n' + getMessage(interaction.guild_locale, 'chess_move_last');
			let fieldColor = (+curPos + Math.trunc(curPos / 8)) % 2;
			components.push( buildActionRow(
				buildButton('chess_' + newPos[0] + '_p_' + castling + '_wn_', ButtonStyle.Primary, gamePieces.wn[fieldColor]),
				buildButton('chess_' + newPos[0] + '_p_' + castling + '_wb_', ButtonStyle.Primary, gamePieces.wb[fieldColor]),
				buildButton('chess_' + newPos[0] + '_p_' + castling + '_wr_', ButtonStyle.Primary, gamePieces.wr[fieldColor]),
				buildButton('chess_' + newPos[0] + '_p_' + castling + '_wq_', ButtonStyle.Primary, gamePieces.wq[fieldColor])
			) );
		}
		else if ( gameGrid[newPos[0]] === 'bp' && newPos[0] > 55 ) {
			allowed_mentions.users = [interaction.user.id];
			text += getMessage(interaction.guild_locale, 'game_turn', `<@${interaction.user.id}>`) + '\n' + getMessage(interaction.guild_locale, 'chess_move_last');
			let fieldColor = (+curPos + Math.trunc(curPos / 8)) % 2;
			components.push( buildActionRow(
				buildButton('chess_' + newPos[0] + '_p_' + castling + '_bn_', ButtonStyle.Primary, gamePieces.bn[fieldColor]),
				buildButton('chess_' + newPos[0] + '_p_' + castling + '_bb_', ButtonStyle.Primary, gamePieces.bb[fieldColor]),
				buildButton('chess_' + newPos[0] + '_p_' + castling + '_br_', ButtonStyle.Primary, gamePieces.br[fieldColor]),
				buildButton('chess_' + newPos[0] + '_p_' + castling + '_bq_', ButtonStyle.Primary, gamePieces.bq[fieldColor])
			) );
		}
		else {
			let opponent = ( interaction.user.id === player2 ? player1 : player2 );
			allowed_mentions.users = [opponent];
			text += getMessage(interaction.guild_locale, 'game_turn', `<@${opponent}>`) + '\n' + getMessage(interaction.guild_locale, 'chess_move_last');
			components.push(...chess_getPieces(gameGrid, ( interaction.user.id === player2 ? 'w' : 'b' ), castling, interaction.guild_locale));
			if ( chess_isCheck(gameGrid, gameGrid[newPos[0]][0]) ) {
				if ( newMove.includes( ' e.p.' ) ) newMove = newMove.replace( ' e.p.', '+ e.p.' );
				else newMove += '+';
			}
		}
		text += newMove;
		if ( gameGrid[newPos[0]] === 'wp' && curPos - newPos[0] === 16 ) {
			if ( gameGrid[+newPos[0] - 1] === 'bp' ) {
				let boardCopy = gameGrid.slice();
				boardCopy[+newPos[0] + 8] = 'bp';
				boardCopy[+newPos[0] - 1] = '';
				boardCopy[newPos[0]] = '';
				if ( !chess_isCheck(boardCopy, 'b') ) components.some( component => {
					let button = component.components.find( button => button.custom_id.startsWith( 'chess_' + (+newPos[0] - 1) + '_o' ) );
					if ( !button ) return false;
					button.disabled = false;
					button.custom_id += '_' + (+newPos[0] + 8);
					return true;
				} );
			}
			if ( gameGrid[+newPos[0] + 1] === 'bp' ) {
				let boardCopy = gameGrid.slice();
				boardCopy[+newPos[0] + 8] = 'bp';
				boardCopy[+newPos[0] + 1] = '';
				boardCopy[newPos[0]] = '';
				if ( !chess_isCheck(boardCopy, 'b') ) components.some( component => {
					let button = component.components.find( button => button.custom_id.startsWith( 'chess_' + (+newPos[0] + 1) + '_o' ) );
					if ( !button ) return false;
					button.disabled = false;
					button.custom_id += '_' + (+newPos[0] + 8);
					return true;
				} );
			}
		}
		if ( gameGrid[newPos[0]] === 'bp' && curPos - newPos[0] === -16 ) {
			if ( gameGrid[+newPos[0] - 1] === 'wp' ) {
				let boardCopy = gameGrid.slice();
				boardCopy[+newPos[0] - 8] = 'wp';
				boardCopy[+newPos[0] - 1] = '';
				boardCopy[newPos[0]] = '';
				if ( !chess_isCheck(boardCopy, 'w') ) components.some( component => {
					let button = component.components.find( button => button.custom_id.startsWith( 'chess_' + (+newPos[0] - 1) + '_o' ) );
					if ( !button ) return false;
					button.disabled = false;
					button.custom_id += '_' + (+newPos[0] - 8);
					return true;
				} );
			}
			if ( gameGrid[+newPos[0] + 1] === 'wp' ) {
				let boardCopy = gameGrid.slice();
				boardCopy[+newPos[0] - 8] = 'wp';
				boardCopy[+newPos[0] + 1] = '';
				boardCopy[newPos[0]] = '';
				if ( !chess_isCheck(boardCopy, 'w') ) components.some( component => {
					let button = component.components.find( button => button.custom_id.startsWith( 'chess_' + (+newPos[0] + 1) + '_o' ) );
					if ( !button ) return false;
					button.disabled = false;
					button.custom_id += '_' + (+newPos[0] - 8);
					return true;
				} );
			}
		}
		if ( !components.some( component => component.components.some( button => !button.disabled ) ) ) {
			allowed_mentions = {parse: []};
			components = [];
			let textParts = text.split('\n');
			if ( textParts[3].includes( '+' ) ) {
				textParts[1] = textParts[1].replace( 'vs.', ( interaction.user.id === player1 ? '**1–0**' : '**0–1**' ) );
				textParts[2] = getMessage(interaction.guild_locale, 'game_end_won', `<@${interaction.user.id}>`) + ' 🎉';
				textParts[3] = textParts[3].replace( '+', '#' );
			}
			else {
				textParts[1] = textParts[1].replace( 'vs.', '**½–½**' );
				textParts[2] = getMessage(interaction.guild_locale, 'chess_end_draw_stalemate');
			}
			text = textParts.join('\n');
			chessGames.delete(interaction.message.id);
		}
		else if ( gameGrid.filter( pos => pos && !pos.endsWith( 'k' ) ).every( (pos, i) => {
			if ( i > 0 ) return false;
			return ( pos.endsWith( 'n' ) || pos.endsWith( 'b' ) );
		} ) ) {
			allowed_mentions = {parse: []};
			components = [];
			let textParts = text.split('\n');
			textParts[1] = textParts[1].replace( 'vs.', '**½–½**' );
			textParts[2] = getMessage(interaction.guild_locale, 'chess_end_draw_dead');
			text = textParts.join('\n');
			chessGames.delete(interaction.message.id);
		}
		else if ( castling.slice(4) >= 75 ) {
			allowed_mentions = {parse: []};
			components = [];
			let textParts = text.split('\n');
			textParts[1] = textParts[1].replace( 'vs.', '**½–½**' );
			textParts[2] = getMessage(interaction.guild_locale, 'chess_end_draw_75');
			text = textParts.join('\n');
			chessGames.delete(interaction.message.id);
		}
		else {
			let uniquePos = gameGrid.join('_') + '_' + components.map( row => row.components.map( button => button.custom_id ).join('_') ).join('_').replace( /_([10]{4})\d+/g, '_$1' );
			posList.set(uniquePos, ( posList.get(uniquePos) || 0 ) + 1);
			if ( posList.get(uniquePos) >= 5 ) {
				allowed_mentions = {parse: []};
				components = [];
				let textParts = text.split('\n');
				textParts[1] = textParts[1].replace( 'vs.', '**½–½**' );
				textParts[2] = getMessage(interaction.guild_locale, 'chess_end_draw_5');
				text = textParts.join('\n');
				chessGames.delete(interaction.message.id);
			}
			else if ( castling.slice(4) === '50' || ( posList.get(uniquePos) >= 3 && posList.get('prev') < 3 ) ) {
				let drawRule = ( castling.slice(4) === '50' ? '50' : '3' );
				allowed_mentions.users = [currentPlayer];
				let textParts = text.split('\n');
				textParts[2] = getMessage(interaction.guild_locale, 'chess_draw_offer_' + drawRule);
				text = textParts.join('\n');
				components.forEach( row => row.components.forEach( button => button.disabled = true ) );
				components.push( buildActionRow(
					buildButton('chess_draw_' + drawRule, ButtonStyle.Danger, '🤝', getMessage(interaction.guild_locale, 'chess_draw_' + drawRule)),
					buildButton('chess_draw_no', ButtonStyle.Success, '↪️', getMessage(interaction.guild_locale, 'chess_draw_no'))
				) );
			}
			else if ( interaction.message.content.split('\n\n')[0].split('\n')[4] ) components.push( buildActionRow(
				buildButton('chess_resign', ButtonStyle.Danger, '☠️', getMessage(interaction.guild_locale, 'chess_resign')),
				( posList.get(uniquePos) >= 3 ?
					buildButton('chess_draw_3', ButtonStyle.Danger, '🤝', getMessage(interaction.guild_locale, 'chess_draw_3'))
				: ( castling.slice(4) >= 50 ?
					buildButton('chess_draw_50', ButtonStyle.Danger, '🤝', getMessage(interaction.guild_locale, 'chess_draw_50'))
				:
					buildButton('chess_draw', ButtonStyle.Primary, '🤝', getMessage(interaction.guild_locale, 'chess_draw'))
				) )
			) );
			posList.set('prev', posList.get(uniquePos));
		}
	}
	else if ( indicator === 'p' ) {
		let opponent = ( interaction.user.id === player2 ? player1 : player2 );
		allowed_mentions.users = [opponent];
		text += getMessage(interaction.guild_locale, 'game_turn', `<@${opponent}>`) + `\n${lastMove}=`;
		gameGrid[curPos] = newPos[0];
		switch ( newPos[0] ) {
			case 'wn':
			case 'bn':
				text += getMessage(interaction.guild_locale, 'chess_piece_knight');
				break;
			case 'wb':
			case 'bb':
				text += getMessage(interaction.guild_locale, 'chess_piece_bishop');
				break;
			case 'wr':
			case 'br':
				text += getMessage(interaction.guild_locale, 'chess_piece_rook');
				break;
			case 'wq':
			case 'bq':
				text += getMessage(interaction.guild_locale, 'chess_piece_queen');
				break;
		}
		components.push(...chess_getPieces(gameGrid, ( interaction.user.id === player2 ? 'w' : 'b' ), castling, interaction.guild_locale));
		let uniquePos = gameGrid.join('_') + '_' + components.map( row => row.components.map( button => button.custom_id ).join('_') ).join('_').replace( /_([10]{4})\d+/g, '_$1' );
		chessGames.set(interaction.message.id, new Map([['prev', 0], [uniquePos, 1]]));
		components.push( buildActionRow(
			buildButton('chess_resign', ButtonStyle.Danger, '☠️', getMessage(interaction.guild_locale, 'chess_resign')),
			buildButton('chess_draw', ButtonStyle.Primary, '🤝', getMessage(interaction.guild_locale, 'chess_draw'))
		) );
		if ( chess_isCheck(gameGrid, newPos[0][0]) ) text += '+';
		if ( !components.some( component => component.components.some( button => !button.disabled ) ) ) {
			allowed_mentions = {parse: []};
			components = [];
			let textParts = text.split('\n');
			if ( textParts[3].includes( '+' ) ) {
				textParts[1] = textParts[1].replace( 'vs.', ( interaction.user.id === player1 ? '**1–0**' : '**0–1**' ) );
				textParts[2] = getMessage(interaction.guild_locale, 'game_end_won', `<@${interaction.user.id}>`) + ' 🎉';
				textParts[3] = textParts[3].replace( '+', '#' );
			}
			else {
				textParts[1] = textParts[1].replace( 'vs.', '**½–½**' );
				textParts[2] = getMessage(interaction.guild_locale, 'chess_end_draw_stalemate');
			}
			text = textParts.join('\n');
			chessGames.delete(interaction.message.id);
		}
	}
	else if ( indicator === 'o' ) {
		allowed_mentions.users = [interaction.user.id];
		text += getMessage(interaction.guild_locale, 'game_turn', `<@${interaction.user.id}>`);
		if ( lastMove ) text += '\n' + lastMove;
		text += '\n' + getMessage(interaction.guild_locale, 'chess_move_next');
		text += chess_getPosName(gameGrid[curPos], +curPos, interaction.guild_locale);
		let posButtons = newPos.map( pos => {
			let row = Math.trunc(pos / 8);
			return buildButton('chess_' + curPos + '_m_' + castling + '_' + pos, ButtonStyle.Primary, gamePieces[gameGrid[pos]][(+pos + row) % 2], chess_getPosName(gameGrid[pos], +pos, interaction.guild_locale));
		} );
		if ( posButtons.length > 25 ) components.push(
			buildActionRow(...posButtons.slice(0, 5)),
			buildActionRow(...posButtons.slice(5, 10)),
			buildActionRow(...posButtons.slice(10, 15)),
			buildActionRow(...posButtons.slice(15, 20)),
			buildActionRow( buildButton('chess_' + curPos + '_+_' + castling + '_' + newPos.join('_'), ButtonStyle.Primary, '➕', getMessage(interaction.guild_locale, 'chess_more')) )
		);
		else {
			components.push( buildActionRow(...posButtons.slice(0, 5)) );
			if ( posButtons.length > 5 ) components.push( buildActionRow(...posButtons.slice(5, 10)) );
			if ( posButtons.length > 10 ) components.push( buildActionRow(...posButtons.slice(10, 15)) );
			if ( posButtons.length > 15 ) components.push( buildActionRow(...posButtons.slice(15, 20)) );
			if ( posButtons.length > 20 ) components.push( buildActionRow(...posButtons.slice(20, 25)) );
		}
	}
	else if ( indicator === '+' ) {
		allowed_mentions.users = [interaction.user.id];
		text += getMessage(interaction.guild_locale, 'game_turn', `<@${interaction.user.id}>`) + '\n' + lastMove;
		components.push(
			buildActionRow(...newPos.slice(25).map( pos => {
				let row = Math.trunc(pos / 8);
				return buildButton('chess_' + curPos + '_m_' + castling + '_' + pos, ButtonStyle.Primary, gamePieces[gameGrid[pos]][(+pos + row) % 2], chess_getPosName(gameGrid[pos], +pos, interaction.guild_locale));
			} )),
			buildActionRow( buildButton('chess_' + curPos + '_o_' + castling + '_' + newPos.join('_'), ButtonStyle.Primary, '➕', getMessage(interaction.guild_locale, 'chess_more')) )
		);
	}
	return {
		type: InteractionResponseType.UpdateMessage,
		data: {
			content: text + '\n\n' + chess_gridToBoard(gameGrid),
			components, allowed_mentions
		}
	};
}

/**
 * @param {String} piece
 * @param {Number} pos
 * @param {import('discord-api-types/v10').LocaleString} locale
 * @returns {String}
 */
 function chess_getPosName(piece, pos, locale) {
	let posName = String.fromCharCode(97 + pos % 8) + (8 - Math.trunc(pos / 8));
	switch ( piece ) {
		case 'wn':
		case 'bn':
			posName = getMessage(locale, 'chess_piece_knight') + posName;
			break;
		case 'wb':
		case 'bb':
			posName = getMessage(locale, 'chess_piece_bishop') + posName;
			break;
		case 'wr':
		case 'br':
			posName = getMessage(locale, 'chess_piece_rook') + posName;
			break;
		case 'wq':
		case 'bq':
			posName = getMessage(locale, 'chess_piece_queen') + posName;
			break;
		case 'wk':
		case 'bk':
			posName = getMessage(locale, 'chess_piece_king') + posName;
			break;
	}
	return posName;
}

/**
 * @param {String[]} board
 * @param {'w'|'b'} opponent
 * @returns {Boolean}
 */
function chess_isCheck(board, opponent) {
	let king = board.indexOf(( opponent === 'w' ? 'b' : 'w' ) + 'k');
	return board.some( (piece, i) => {
		if ( !piece.startsWith( opponent ) ) return false;
		switch (piece[1]) {
			case 'p':
				let direction = ( opponent === 'w' ? -8 : 8 );
				let nextPos = i + direction;
				if ( nextPos - 1 === king && Math.abs((nextPos - 1) % 8 - i % 8) === 1 ) return true;
				if ( nextPos + 1 === king && Math.abs((nextPos + 1) % 8 - i % 8) === 1 ) return true;
				break;
			case 'n':
				if ( i - 17 === king && Math.abs((i - 17) % 8 - i % 8) === 1 ) return true;
				if ( i - 15 === king && Math.abs((i - 15) % 8 - i % 8) === 1 ) return true;
				if ( i - 10 === king && Math.abs((i - 10) % 8 - i % 8) === 2 ) return true;
				if ( i - 6 === king && Math.abs((i - 6) % 8 - i % 8) === 2 ) return true;
				if ( i + 6 === king && Math.abs((i + 6) % 8 - i % 8) === 2 ) return true;
				if ( i + 10 === king && Math.abs((i + 10) % 8 - i % 8) === 2 ) return true;
				if ( i + 15 === king && Math.abs((i + 15) % 8 - i % 8) === 1 ) return true;
				if ( i + 17 === king && Math.abs((i + 17) % 8 - i % 8) === 1 ) return true;
				break;
			case 'b':
				if ( chess_moveInDirection(board, opponent, i, -9).includes(king) ) return true;
				if ( chess_moveInDirection(board, opponent, i, -7).includes(king) ) return true;
				if ( chess_moveInDirection(board, opponent, i, 7).includes(king) ) return true;
				if ( chess_moveInDirection(board, opponent, i, 9).includes(king) ) return true;
				break;
			case 'r':
				if ( chess_moveInDirection(board, opponent, i, -8).includes(king) ) return true;
				if ( chess_moveInDirection(board, opponent, i, -1).includes(king) ) return true;
				if ( chess_moveInDirection(board, opponent, i, 1).includes(king) ) return true;
				if ( chess_moveInDirection(board, opponent, i, 8).includes(king) ) return true;
				break;
			case 'q':
				if ( chess_moveInDirection(board, opponent, i, -9).includes(king) ) return true;
				if ( chess_moveInDirection(board, opponent, i, -7).includes(king) ) return true;
				if ( chess_moveInDirection(board, opponent, i, 7).includes(king) ) return true;
				if ( chess_moveInDirection(board, opponent, i, 9).includes(king) ) return true;
				if ( chess_moveInDirection(board, opponent, i, -8).includes(king) ) return true;
				if ( chess_moveInDirection(board, opponent, i, -1).includes(king) ) return true;
				if ( chess_moveInDirection(board, opponent, i, 1).includes(king) ) return true;
				if ( chess_moveInDirection(board, opponent, i, 8).includes(king) ) return true;
				break;
			case 'k':
				if ( i - 9 === king && Math.abs((i - 9) % 8 - i % 8) === 1 ) return true;
				if ( i - 8 === king && Math.abs((i - 8) % 8 - i % 8) === 0 ) return true;
				if ( i - 7 === king && Math.abs((i - 7) % 8 - i % 8) === 1 ) return true;
				if ( i - 1 === king && Math.abs((i - 1) % 8 - i % 8) === 1 ) return true;
				if ( i + 1 === king && Math.abs((i + 1) % 8 - i % 8) === 1 ) return true;
				if ( i + 7 === king && Math.abs((i + 7) % 8 - i % 8) === 1 ) return true;
				if ( i + 8 === king && Math.abs((i + 8) % 8 - i % 8) === 0 ) return true;
				if ( i + 9 === king && Math.abs((i + 9) % 8 - i % 8) === 1 ) return true;
				break;
		}
		return false;
	} );
}

/**
 * @param {String[]} grid
 * @returns {String}
 */
 function chess_gridToBoard(grid) {
	return grid.map( (piece, i) => {
		let row = Math.trunc(i / 8);
		return gamePieces[piece][(i + row) % 2] + ( i % 8 == 7 ? emojiNumberList[7 - row] + '\n' : '' );
	} ).join('') + '🇦⁣🇧⁣🇨⁣🇩⁣🇪⁣🇫⁣🇬⁣🇭';
}

/**
 * @param {String[]} board
 * @param {'w'|'b'} player
 * @param {String} castling
 * @param {import('discord-api-types/v10').LocaleString} locale
 * @returns {import('discord-api-types/v10').APIActionRowComponent<import('discord-api-types/v10').APIButtonComponentWithCustomId>[]}
 */
function chess_getPieces(board, player, castling, locale) {
	let opponent = ( player === 'w' ? 'b' : 'w' );
	/** @type {Object.<string, import('discord-api-types/v10').APIButtonComponentWithCustomId[]>} */
	let pieces = {
		p: [],
		n: [],
		b: [],
		r: [],
		q: [],
		k: []
	};
	board.forEach( (piece, i) => {
		if ( !piece.startsWith( player ) ) return;
		let row = Math.trunc(i / 8);
		let moves = [];
		switch (piece[1]) {
			case 'p':
				let direction = ( player === 'w' ? -8 : 8 );
				let nextPos = i + direction;
				if ( nextPos - 1 >= 0 && nextPos - 1 < 64 && Math.abs((nextPos - 1) % 8 - i % 8) === 1 && board[nextPos - 1].startsWith( opponent ) ) moves.push(nextPos - 1);
				if ( nextPos + 1 >= 0 && nextPos + 1 < 64 && Math.abs((nextPos + 1) % 8 - i % 8) === 1 && board[nextPos + 1].startsWith( opponent ) ) moves.push(nextPos + 1);
				if ( nextPos >= 0 && nextPos < 64 && !board[nextPos] ) {
					moves.push(nextPos);
					if ( row === ( player === 'w' ? 6 : 1 ) ) {
						nextPos += direction;
						if ( nextPos >= 0 && nextPos < 64 && !board[nextPos] ) moves.push(nextPos);
					}
				}
				moves = moves.filter( nextPos => {
					let boardCopy = board.slice();
					boardCopy[nextPos] = boardCopy[i];
					boardCopy[i] = '';
					return !chess_isCheck(boardCopy, opponent);
				} );
				break;
			case 'n':
				if ( i - 17 >= 0 && i - 17 < 64 && Math.abs((i - 17) % 8 - i % 8) === 1 && !board[i - 17].startsWith( player ) ) moves.push(i - 17);
				if ( i - 15 >= 0 && i - 15 < 64 && Math.abs((i - 15) % 8 - i % 8) === 1 && !board[i - 15].startsWith( player ) ) moves.push(i - 15);
				if ( i - 10 >= 0 && i - 10 < 64 && Math.abs((i - 10) % 8 - i % 8) === 2 && !board[i - 10].startsWith( player ) ) moves.push(i - 10);
				if ( i - 6 >= 0 && i - 6 < 64 && Math.abs((i - 6) % 8 - i % 8) === 2 && !board[i - 6].startsWith( player ) ) moves.push(i - 6);
				if ( i + 6 >= 0 && i + 6 < 64 && Math.abs((i + 6) % 8 - i % 8) === 2 && !board[i + 6].startsWith( player ) ) moves.push(i + 6);
				if ( i + 10 >= 0 && i + 10 < 64 && Math.abs((i + 10) % 8 - i % 8) === 2 && !board[i + 10].startsWith( player ) ) moves.push(i + 10);
				if ( i + 15 >= 0 && i + 15 < 64 && Math.abs((i + 15) % 8 - i % 8) === 1 && !board[i + 15].startsWith( player ) ) moves.push(i + 15);
				if ( i + 17 >= 0 && i + 17 < 64 && Math.abs((i + 17) % 8 - i % 8) === 1 && !board[i + 17].startsWith( player ) ) moves.push(i + 17);
				moves = moves.filter( nextPos => {
					let boardCopy = board.slice();
					boardCopy[nextPos] = boardCopy[i];
					boardCopy[i] = '';
					return !chess_isCheck(boardCopy, opponent);
				} );
				break;
			case 'b':
				moves.push(...chess_moveInDirection(board, player, i, -9).reverse());
				moves.push(...chess_moveInDirection(board, player, i, -7).reverse());
				moves.push(...chess_moveInDirection(board, player, i, 7));
				moves.push(...chess_moveInDirection(board, player, i, 9));
				moves = moves.filter( nextPos => {
					let boardCopy = board.slice();
					boardCopy[nextPos] = boardCopy[i];
					boardCopy[i] = '';
					return !chess_isCheck(boardCopy, opponent);
				} );
				break;
			case 'r':
				moves.push(...chess_moveInDirection(board, player, i, -8).reverse());
				moves.push(...chess_moveInDirection(board, player, i, -1).reverse());
				moves.push(...chess_moveInDirection(board, player, i, 1));
				moves.push(...chess_moveInDirection(board, player, i, 8));
				moves = moves.filter( nextPos => {
					let boardCopy = board.slice();
					boardCopy[nextPos] = boardCopy[i];
					boardCopy[i] = '';
					return !chess_isCheck(boardCopy, opponent);
				} );
				break;
			case 'q':
				moves.push(...chess_moveInDirection(board, player, i, -9).reverse());
				moves.push(...chess_moveInDirection(board, player, i, -7).reverse());
				moves.push(...chess_moveInDirection(board, player, i, 7));
				moves.push(...chess_moveInDirection(board, player, i, 9));
				moves.push(...chess_moveInDirection(board, player, i, -8).reverse());
				moves.push(...chess_moveInDirection(board, player, i, -1).reverse());
				moves.push(...chess_moveInDirection(board, player, i, 1));
				moves.push(...chess_moveInDirection(board, player, i, 8));
				moves = moves.filter( nextPos => {
					let boardCopy = board.slice();
					boardCopy[nextPos] = boardCopy[i];
					boardCopy[i] = '';
					return !chess_isCheck(boardCopy, opponent);
				} );
				break;
			case 'k':
				if ( i - 9 >= 0 && i - 9 < 64 && Math.abs((i - 9) % 8 - i % 8) === 1 && !board[i - 9].startsWith( player ) ) moves.push(i - 9);
				if ( i - 8 >= 0 && i - 8 < 64 && Math.abs((i - 8) % 8 - i % 8) === 0 && !board[i - 8].startsWith( player ) ) moves.push(i - 8);
				if ( i - 7 >= 0 && i - 7 < 64 && Math.abs((i - 7) % 8 - i % 8) === 1 && !board[i - 7].startsWith( player ) ) moves.push(i - 7);
				if ( i - 1 >= 0 && i - 1 < 64 && Math.abs((i - 1) % 8 - i % 8) === 1 && !board[i - 1].startsWith( player ) ) moves.push(i - 1);
				if ( i + 1 >= 0 && i + 1 < 64 && Math.abs((i + 1) % 8 - i % 8) === 1 && !board[i + 1].startsWith( player ) ) moves.push(i + 1);
				if ( i + 7 >= 0 && i + 7 < 64 && Math.abs((i + 7) % 8 - i % 8) === 1 && !board[i + 7].startsWith( player ) ) moves.push(i + 7);
				if ( i + 8 >= 0 && i + 8 < 64 && Math.abs((i + 8) % 8 - i % 8) === 0 && !board[i + 8].startsWith( player ) ) moves.push(i + 8);
				if ( i + 9 >= 0 && i + 9 < 64 && Math.abs((i + 9) % 8 - i % 8) === 1 && !board[i + 9].startsWith( player ) ) moves.push(i + 9);
				moves = moves.filter( nextPos => {
					let boardCopy = board.slice();
					boardCopy[nextPos] = boardCopy[i];
					boardCopy[i] = '';
					return !chess_isCheck(boardCopy, opponent);
				} );
				if ( !chess_isCheck(board, opponent) ) {
					if ( player === 'w' && i === 60 ) {
						if ( +castling[0] && board[56] === 'wr' && board[57] === '' && board[58] === '' && board[59] === '' ) {
							let boardCopy1 = board.slice();
							boardCopy1[59] = 'wk';
							boardCopy1[60] = '';
							let boardCopy2 = board.slice();
							boardCopy2[56] = '';
							boardCopy2[58] = 'wk';
							boardCopy2[59] = 'wr';
							boardCopy2[60] = '';
							if ( !chess_isCheck(boardCopy1, opponent) && !chess_isCheck(boardCopy2, opponent) ) moves.push(58);
						}
						if ( +castling[1] && board[63] === 'wr' && board[62] === '' && board[61] === '' ) {
							let boardCopy1 = board.slice();
							boardCopy1[61] = 'wk';
							boardCopy1[60] = '';
							let boardCopy2 = board.slice();
							boardCopy2[63] = '';
							boardCopy2[62] = 'wk';
							boardCopy2[61] = 'wr';
							boardCopy2[60] = '';
							if ( !chess_isCheck(boardCopy1, opponent) && !chess_isCheck(boardCopy2, opponent) ) moves.push(62);
						}
					}
					if ( player === 'b' && i === 4 ) {
						if ( +castling[2] && board[0] === 'br' && board[1] === '' && board[2] === '' && board[3] === '' ) {
							let boardCopy1 = board.slice();
							boardCopy1[3] = 'bk';
							boardCopy1[4] = '';
							let boardCopy2 = board.slice();
							boardCopy2[0] = '';
							boardCopy2[2] = 'bk';
							boardCopy2[3] = 'br';
							boardCopy2[4] = '';
							if ( !chess_isCheck(boardCopy1, opponent) && !chess_isCheck(boardCopy2, opponent) ) moves.push(2);
						}
						if ( +castling[3] && board[7] === 'br' && board[6] === '' && board[5] === '' ) {
							let boardCopy1 = board.slice();
							boardCopy1[5] = 'bk';
							boardCopy1[4] = '';
							let boardCopy2 = board.slice();
							boardCopy2[7] = '';
							boardCopy2[6] = 'bk';
							boardCopy2[5] = 'br';
							boardCopy2[4] = '';
							if ( !chess_isCheck(boardCopy1, opponent) && !chess_isCheck(boardCopy2, opponent) ) moves.push(6);
						}
					}
				}
				break;
		}
		pieces[piece[1]].push(
			buildButton('chess_' + i + '_o_' + castling + ( moves.length ? '_' + moves.join('_') : '' ), ButtonStyle.Primary, gamePieces[piece][(i + row) % 2], chess_getPosName(piece, i, locale), !moves.length)
		);
	} );
	if ( player === 'b' ) {
		pieces.p.reverse();
		pieces.n.reverse();
		pieces.b.reverse();
		pieces.r.reverse();
		pieces.q.reverse();
		pieces.k.reverse();
	}
	let pawn = [...pieces.p];
	let light = [...pieces.n, ...pieces.b];
	let heavy = [...pieces.r, ...pieces.q, ...pieces.k];
	/** @type {import('discord-api-types/v10').APIActionRowComponent<import('discord-api-types/v10').APIButtonComponentWithCustomId>[]} */
	let components = [];
	if ( light.length > 5 || heavy.length > 5 ) {
		let allButtons = [...pawn, ...light, ...heavy];
		components.push(buildActionRow(...allButtons.slice(0, 4)));
		if ( allButtons.length > 4 ) components.push(buildActionRow(...allButtons.slice(4, 8)));
		if ( allButtons.length > 8 ) components.push(buildActionRow(...allButtons.slice(8, 12)));
		if ( allButtons.length > 12 ) components.push(buildActionRow(...allButtons.slice(12, 16)));
	}
	else if ( pawn.length + light.length + heavy.length <= 5 ) components.push(buildActionRow(...pawn, ...light, ...heavy));
	else {
		if ( pawn.length ) {
			if ( pawn.length <= 5 ) components.push(buildActionRow(...pawn));
			else {
				components.push(buildActionRow(...pawn.slice(0, 4)));
				if ( pawn.length > 4 ) components.push(buildActionRow(...pawn.slice(4, 8)));
			}
		}
		if ( light.length + heavy.length <= 5 ) components.push(buildActionRow(...light, ...heavy));
		else {
			if ( light.length ) components.push(buildActionRow(...light));
			components.push(buildActionRow(...heavy));
		}
	}
	return components;
}

/**
 * @param {String[]} board
 * @param {'w'|'b'} player
 * @param {Number} start
 * @param {Number} direction
 * @returns {Number[]}
 */
function chess_moveInDirection(board, player, start, direction) {
	let moves = [];
	let nextPos = start + direction;
	while ( nextPos >= 0 && nextPos < 64 && Math.abs(nextPos % 8 - start % 8) <= 1 && !board[nextPos].startsWith( player ) ) {
		moves.push(nextPos);
		if ( board[nextPos] ) break;
		start = nextPos;
		nextPos += direction;
	}
	return moves;
}

export default {
	slash: chess_slash,
	button: chess_button
};