import { ButtonStyle, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { buildButton, buildActionRow, emojiNumberList, getCommandOption, getCommandUserOption, getMessage } from '../util.js';

// /eval code:updateApplicationCommand('connectfour')

/**
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction
 * @returns {import('discord-api-types/v10').APIInteractionResponseChannelMessageWithSource}
 */
function connectfour_slash(interaction) {
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
	let text = '**' + getMessage(interaction.guild_locale, 'connectfour') + '**\n';
	/** @type {import('discord-api-types/v10').APIAllowedMentions} */
	let allowed_mentions = {parse: []};
	/** @type {[Number, Number]} */
	let fieldSize = [( getCommandOption(interaction, 'width')?.value || 7 ), ( getCommandOption(interaction, 'height')?.value || 6 )];
	/** @type {import('discord-api-types/v10').APIActionRowComponent<import('discord-api-types/v10').APIButtonComponentWithCustomId>[]} */
	let components = [];
	let allButtons = emojiNumberList.slice(0, fieldSize[0]).map( (emoji, i) => {
		return buildButton('connectfour_' + i, ButtonStyle.Primary, emoji);
	} );
	if ( allButtons.length > 5 ) {
		let rowLength = Math.round(allButtons.length / 2);
		components.push(
			buildActionRow(...allButtons.slice(0, rowLength)),
			buildActionRow(...allButtons.slice(rowLength))
		);
	}
	else components.push(buildActionRow(...allButtons));
	if ( opponent ) {
		allowed_mentions.users = [opponent];
		text += getMessage(interaction.guild_locale, 'connectfour_challenge', `<@${interaction.user.id}>`, `<@${opponent}>`, `<@${opponent}>`);
		components.push( buildActionRow( buildButton('connectfour_no', ButtonStyle.Danger, null, getMessage(interaction.guild_locale, 'button_decline')) ) );
	}
	else text += getMessage(interaction.guild_locale, 'connectfour_start', `<@${interaction.user.id}>`);
	let gameGrid = '\n\n' + emojiNumberList.slice(0, fieldSize[0]).join('') + ( '\n' + '⭕'.repeat(fieldSize[0]) ).repeat(fieldSize[1]);
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: text + gameGrid,
			components, allowed_mentions
		}
	};
}

/**
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction
 * @param {String[]} playerList
 * @returns {import('discord-api-types/v10').APIInteractionResponseUpdateMessage|import('discord-api-types/v10').APIInteractionResponseChannelMessageWithSource}
 */
function connectfour_button(interaction, playerList) {
	if ( interaction.data.custom_id === 'connectfour_no' && interaction.user.id === playerList[1] ) {
		let content = '**' + getMessage(interaction.guild_locale, 'connectfour') + '**\n';
		content += getMessage(interaction.guild_locale, 'challenge_declined', `<@${playerList[1]}>`, `<@${playerList[0]}>`);
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
	let gameGrid = interaction.message.content.split(emojiNumberList.slice(0, 4).join(''))[1].split('\n').slice(1).map( gameRow => [...gameRow] );
	let playedActions = gameGrid.map( gameRow => gameRow.filter( gameField => ( gameField === '🔵' || gameField === '🟢' ) ).length ).reduce( (a, b) => a + b, 0 );
	if ( interaction.user.id === playerList[playedActions % 2] ) return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: getMessage(interaction.locale, 'error_not_your_turn'),
			flags: MessageFlags.Ephemeral,
			allowed_mentions: {
				parse: []
			}
		}
	};
	/** @type {import('discord-api-types/v10').APIActionRowComponent<import('discord-api-types/v10').APIButtonComponentWithCustomId>[]} */
	let components = interaction.message.components;
	if ( components[components.length - 1].components[0].custom_id === 'connectfour_no' ) components.pop();
	let text = '**' + getMessage(interaction.guild_locale, 'connectfour') + '**';
	text += `\n<@${playerList[0]}> (🔵) vs. <@${playerList[1]}> (🟢)\n`;
	/** @type {import('discord-api-types/v10').APIAllowedMentions} */
	let allowed_mentions = {parse: []};
	let playerEmoji = ( interaction.user.id === playerList[1] ? '🟢' : '🔵' );
	/** @type {[Number, Number]} */
	let fieldClicked = [null, +interaction.data.custom_id.replace( 'connectfour_', '' )];
	gameGrid.forEach( (gameRow, i) => {
		if ( gameRow[fieldClicked[1]] !== '⭕' ) return;
		if ( gameGrid[i + 1]?.[fieldClicked[1]] !== '⭕' ) {
			gameRow[fieldClicked[1]] = playerEmoji;
			fieldClicked[0] = i;
		}
	} );
	let allButtons = components.flatMap( component => component.components );
	if ( gameGrid[0][fieldClicked[1]] !== '⭕' ) allButtons[fieldClicked[1]].disabled = true;
	let winLength = 4;
	/** @type {[Number, Number][][]} */
	let isWinRow = [[]];
	for (let i = 0; i < winLength; i++) {
		isWinRow[0].push( gameGrid[fieldClicked[0] + i]?.[fieldClicked[1]] === playerEmoji ? [fieldClicked[0] + i, fieldClicked[1]] : [] );
		isWinRow.push([], [], []);
		for (let j = 0; j < winLength; j++) {
			let iRow = i * 3;
			isWinRow[iRow + 1].push( gameGrid[fieldClicked[0]]?.[fieldClicked[1] + i - j] === playerEmoji ? [fieldClicked[0], fieldClicked[1] + i - j] : [] );
			isWinRow[iRow + 2].push( gameGrid[fieldClicked[0] + i - j]?.[fieldClicked[1] + i - j] === playerEmoji ? [fieldClicked[0] + i - j, fieldClicked[1] + i - j] : [] );
			isWinRow[iRow + 3].push( gameGrid[fieldClicked[0] + i - j]?.[fieldClicked[1] - i + j] === playerEmoji ? [fieldClicked[0] + i - j, fieldClicked[1] - i + j] : [] );
		}
	}
	if ( isWinRow.some( winRow => winRow.every( winField => winField.length === 2 ) ) ) {
		let winIcon = ( interaction.user.id === playerList[1] ? '🟩' : '🟦' );
		isWinRow.filter( winRow => winRow.every( winField => winField.length === 2 ) ).forEach( winRow => {
			winRow.forEach( winField => {
				gameGrid[winField[0]][winField[1]] = winIcon;
			} );
		} );
		components = [];
		text += getMessage(interaction.guild_locale, 'game_end_won', `<@${interaction.user.id}>`) + ' 🎉';
	}
	else if ( gameGrid.every( gameRow => gameRow.every( gameField => gameField !== '⭕' ) ) ) {
		components = [];
		text += getMessage(interaction.guild_locale, 'game_end_draw');
	}
	else {
		let opponent = ( interaction.user.id === playerList[1] ? playerList[0] : playerList[1] );
		allowed_mentions.users = [opponent];
		text += getMessage(interaction.guild_locale, 'game_turn', `<@${opponent}>`);
	}
	return {
		type: InteractionResponseType.UpdateMessage,
		data: {
			content: text + '\n\n' + emojiNumberList.slice(0, gameGrid[0].length).join('') + '\n' + gameGrid.map( gameRow => gameRow.join('') ).join('\n'),
			components, allowed_mentions
		}
	};
}

export default {
	slash: connectfour_slash,
	button: connectfour_button
};