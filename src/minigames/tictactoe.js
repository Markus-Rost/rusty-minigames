import { ButtonStyle, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { getMessage, getCommandOption, buildButton, buildActionRow } from '../util.js';

// /eval code:updateApplicationCommand('tictactoe')

const winConditions = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6]
];
const winConditions4x4 = [
	[0, 1, 2, 3],
	[4, 5, 6, 7],
	[8, 9, 10, 11],
	[12, 13, 14, 15],
	[0, 4, 8, 12],
	[1, 5, 9, 13],
	[2, 6, 10, 14],
	[3, 7, 11, 15],
	[0, 5, 10, 15],
	[3, 6, 9, 12],
	[0, 1, 4, 5],
	[1, 2, 5, 6],
	[2, 3, 6, 7],
	[4, 5, 8, 9],
	[5, 6, 9, 10],
	[6, 7, 10, 11],
	[8, 9, 12, 13],
	[9, 10, 13, 14],
	[10, 11, 14, 15]
];
/** @type {import('discord-api-types/v10').APIMessageComponentEmoji} */
const nothingEmoji = {
	id: '866800859051720704',
	name: 'nothing'
};

/**
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction
 * @returns {import('discord-api-types/v10').APIInteractionResponseChannelMessageWithSource}
 */
function tictactoe_slash(interaction) {
	/** @type {String} */
	let opponent = getCommandOption(interaction, 'opponent')?.value;
	let opponentUser = interaction.data.resolved?.users?.[opponent];
	if ( opponentUser && ( opponentUser.bot || opponent === interaction.user.id ) ) return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: getMessage(interaction.locale, 'error_no_bots'),
			flags: MessageFlags.Ephemeral,
			allowed_mentions: {
				parse: []
			}
		}
	};
	/** @type {Boolean} */
	let is4x4 = getCommandOption(interaction, '4x4')?.value;
	let content = '**' + getMessage(interaction.guild_locale, is4x4 ? 'tictactoe_4x4' : 'tictactoe') + '**\n';
	/** @type {import('discord-api-types/v10').APIAllowedMentions} */
	let allowed_mentions = {parse: []};
	/** @type {import('discord-api-types/v10').APIActionRowComponent<import('discord-api-types/v10').APIButtonComponentWithCustomId>[]} */
	let components = [];
	let gridSize = ( is4x4 ? 4 : 3 );
	for (let i = 0; i < gridSize; i++) {
		let componentRow = buildActionRow();
		for (let j = 0; j < gridSize; j++) {
			componentRow.components.push( buildButton('tictactoe_' + (j + (i * gridSize)), ButtonStyle.Primary, nothingEmoji) );
		}
		components.push(componentRow);
	}
	if ( opponent ) {
		allowed_mentions.users = [opponent];
		content += getMessage(interaction.guild_locale, 'tictactoe_challenge', `<@${interaction.user.id}>`, `<@${opponent}>`, `<@${opponent}>`);
		components.push( buildActionRow( buildButton('tictactoe_no', ButtonStyle.Danger, null, getMessage(interaction.guild_locale, 'button_decline')) ) );
	}
	else content += getMessage(interaction.guild_locale, 'tictactoe_start', `<@${interaction.user.id}>`);
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: { content, components, allowed_mentions }
	};
}

/**
 * @param {import('discord-api-types/v10').APIMessageComponentButtonInteraction} interaction
 * @param {String[]} playerList
 * @returns {import('discord-api-types/v10').APIInteractionResponseUpdateMessage|import('discord-api-types/v10').APIInteractionResponseChannelMessageWithSource}
 */
function tictactoe_button(interaction, playerList) {
	/** @type {import('discord-api-types/v10').APIActionRowComponent<import('discord-api-types/v10').APIButtonComponentWithCustomId>[]} */
	let components = interaction.message.components;
	let is4x4 = ( components[3]?.components?.length > 1 );
	if ( interaction.data.custom_id === 'tictactoe_no' && interaction.user.id === playerList[1] ) {
		let content = '**' + getMessage(interaction.guild_locale, is4x4 ? 'tictactoe_4x4' : 'tictactoe') + '**\n';
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
	let playedActions = components.map( component => component.components.filter( button => button.disabled ).length ).reduce( (a, b) => a + b, 0 );
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
	if ( components.length === 5 ) components.pop();
	else if ( components.length === 4 && !is4x4 ) components.pop();
	let content = '**' + getMessage(interaction.guild_locale, is4x4 ? 'tictactoe_4x4' : 'tictactoe') + `**\n<@${playerList[0]}> (⭕) vs. <@${playerList[1]}> (❌)\n`;
	/** @type {import('discord-api-types/v10').APIAllowedMentions} */
	let allowed_mentions = {parse: []};
	let allButtons = components.flatMap( component => component.components );
	let winCheck = new Set();
	let drawCheck = new Set();
	allButtons.forEach( (button, i) => {
		let emoji = ( interaction.user.id === playerList[1] ? '❌' : '⭕' );
		if ( button.custom_id === interaction.data.custom_id ) {
			button.emoji = { id: null, name: emoji };
			button.disabled = true;
			winCheck.add(i);
			return;
		}
		if ( button.emoji.id ) return;
		if ( button.emoji.name === emoji ) winCheck.add(i);
		else drawCheck.add(i);
	} );
	let winCondition = ( is4x4 ? winConditions4x4 : winConditions ).find( winCondition => winCondition.every( button => winCheck.has(button) ) );
	if ( winCondition ) {
		allButtons.forEach( (button, i) => {
			button.disabled = true;
			if ( winCondition.includes( i ) ) button.style = ButtonStyle.Success;
		} );
		content += getMessage(interaction.guild_locale, 'game_end_won', `<@${interaction.user.id}>`) + ' 🎉';
	}
	else if ( ( is4x4 ? winConditions4x4 : winConditions ).every( drawCondition => {
		return drawCondition.some( button => winCheck.has(button) ) && drawCondition.some( button => drawCheck.has(button) );
	} ) ) {
		allButtons.forEach( button => button.disabled = true );
		content += getMessage(interaction.guild_locale, 'game_end_draw');
	}
	else {
		let opponent = ( interaction.user.id === playerList[1] ? playerList[0] : playerList[1] );
		allowed_mentions.users = [opponent];
		content += getMessage(interaction.guild_locale, 'game_turn', `<@${opponent}>`);
	}
	return {
		type: InteractionResponseType.UpdateMessage,
		data: { content, components, allowed_mentions }
	};
}

export default {
	slash: tictactoe_slash,
	button: tictactoe_button
};