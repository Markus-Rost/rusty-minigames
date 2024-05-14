import { ButtonStyle, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { getMessage, getCommandOption, buildActionRow, buildButton } from '../util.js';

// /eval code:updateApplicationCommand('rockpaperscissors')

/**
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction
 * @returns {import('discord-api-types/v10').APIInteractionResponseChannelMessageWithSource}
 */
function rockpaperscissors_slash(interaction) {
	/** @type {String} */
	let opponent = getCommandOption(interaction, 'opponent')?.value;
	let opponentUser = interaction.data.resolved?.users?.[opponent];
	if ( !opponentUser || opponentUser.bot || opponent === interaction.user.id ) return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: getMessage(interaction.locale, 'error_no_bots'),
			flags: MessageFlags.Ephemeral,
			allowed_mentions: {
				parse: []
			}
		}
	}
	let content = '**' + getMessage(interaction.guild_locale, 'rockpaperscissors') + '**';
	content += `\n<@${interaction.user.id}> vs. <@${opponent}>\n`;
	content += getMessage(interaction.guild_locale, 'rockpaperscissors_choose_both');
	/** @type {import('discord-api-types/v10').APIAllowedMentions} */
	let allowed_mentions = {users: [interaction.user.id, opponent]};
	let components = [buildActionRow(
		buildButton('rockpaperscissors_0', ButtonStyle.Primary, '🪨', getMessage(interaction.guild_locale, 'rockpaperscissors_rock')),
		buildButton('rockpaperscissors_1', ButtonStyle.Primary, '📄', getMessage(interaction.guild_locale, 'rockpaperscissors_paper')),
		buildButton('rockpaperscissors_2', ButtonStyle.Primary, '✂️', getMessage(interaction.guild_locale, 'rockpaperscissors_scissors'))
	)];
	if ( interaction.guild_locale === 'de' ) {
		components[0].components[0].emoji.name = '✂️';
		components[0].components[0].label = getMessage(interaction.guild_locale, 'rockpaperscissors_scissors');
		components[0].components[1].emoji.name = '🪨';
		components[0].components[1].label = getMessage(interaction.guild_locale, 'rockpaperscissors_rock');
		components[0].components[2].emoji.name = '📄';
		components[0].components[2].label = getMessage(interaction.guild_locale, 'rockpaperscissors_paper');
	}
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
function rockpaperscissors_button(interaction, ...[player1, player2]) {
	let opponent = ( interaction.user.id === player2 ? player1 : player2 );
	/** @type {import('discord-api-types/v10').APIButtonComponentWithCustomId[]} */
	let components = interaction.message.components[0].components;
	let otherButton = components.find( component => component.custom_id === 'rockpaperscissors_tie' );
	if ( otherButton && interaction.message.content.split('\n')[2]?.includes?.( `<@${opponent}>` ) ) {
		let selectedEmoji = `${otherButton.emoji.name} **${otherButton.label}**`;
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: getMessage(interaction.locale, 'rockpaperscissors_already_chosen', selectedEmoji),
				flags: MessageFlags.Ephemeral,
				allowed_mentions: {
					parse: []
				}
			}
		}
	}
	let content = interaction.message.content.split('\n')[0];
	/** @type {import('discord-api-types/v10').APIAllowedMentions} */
	let allowed_mentions = {parse: []};
	let myButton = components.find( component => component.custom_id === interaction.data.custom_id );
	switch ( interaction.data.custom_id ) {
		case 'rockpaperscissors_0':
			components[0].custom_id = 'rockpaperscissors_tie';
			components[1].custom_id = 'rockpaperscissors_win';
			components[2].custom_id = 'rockpaperscissors_loss';
			content += `\n<@${player1}> vs. <@${player2}>\n`;
			content += getMessage(interaction.guild_locale, 'rockpaperscissors_choose_one', `<@${opponent}>`);
			allowed_mentions.users = [opponent];
			break;
		case 'rockpaperscissors_1':
			components[0].custom_id = 'rockpaperscissors_loss';
			components[1].custom_id = 'rockpaperscissors_tie';
			components[2].custom_id = 'rockpaperscissors_win';
			content += `\n<@${player1}> vs. <@${player2}>\n`;
			content += getMessage(interaction.guild_locale, 'rockpaperscissors_choose_one', `<@${opponent}>`);
			allowed_mentions.users = [opponent];
			break;
		case 'rockpaperscissors_2':
			components[0].custom_id = 'rockpaperscissors_win';
			components[1].custom_id = 'rockpaperscissors_loss';
			components[2].custom_id = 'rockpaperscissors_tie';
			content += `\n<@${player1}> vs. <@${player2}>\n`;
			content += getMessage(interaction.guild_locale, 'rockpaperscissors_choose_one', `<@${opponent}>`);
			allowed_mentions.users = [opponent];
			break;
		case 'rockpaperscissors_win':
			if ( opponent !== player2 ) content += `\n<@${player1}> (${otherButton.emoji.name}) vs. <@${player2}> (${myButton.emoji.name})\n`;
			else content += `\n<@${player1}> (${myButton.emoji.name}) vs. <@${player2}> (${otherButton.emoji.name})\n`;
			content += getMessage(interaction.guild_locale, 'rockpaperscissors_win',
				myButton.emoji.name + ' **' + myButton.label + '**',
				'**' + otherButton.label + '** ' + otherButton.emoji.name
			) + '\n' + getMessage(interaction.guild_locale, 'game_end_won', `<@${interaction.user.id}>`) + ' 🎉';
			components = [];
			break;
		case 'rockpaperscissors_tie':
			content += `\n<@${player1}> (${myButton.emoji.name}) vs. <@${player2}> (${myButton.emoji.name})\n`;
			content += getMessage(interaction.guild_locale, 'rockpaperscissors_tie', myButton.emoji.name + ' **' + myButton.label + '**');
			components = [];
			break;
		case 'rockpaperscissors_loss':
			if ( opponent !== player2 ) content += `\n<@${player1}> (${otherButton.emoji.name}) vs. <@${player2}> (${myButton.emoji.name})\n`;
			else content += `\n<@${player1}> (${myButton.emoji.name}) vs. <@${player2}> (${otherButton.emoji.name})\n`;
			content += getMessage(interaction.guild_locale, 'rockpaperscissors_win',
				otherButton.emoji.name + ' **' + otherButton.label + '**',
				'**' + myButton.label + '** ' + myButton.emoji.name
			) + '\n' + getMessage(interaction.guild_locale, 'game_end_won', `<@${opponent}>`) + ' 🎉';
			components = [];
			break;
	}
	return {
		type: InteractionResponseType.UpdateMessage,
		data: {
			content, allowed_mentions,
			components: ( components.length ? [buildActionRow(...components)] : [] )
		}
	};
}

export default {
	slash: rockpaperscissors_slash,
	button: rockpaperscissors_button
};