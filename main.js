import 'dotenv/config';
import { createServer } from 'node:http';
import { subtle } from 'node:crypto';
import { MessageFlags, InteractionType, InteractionResponseType, ApplicationCommandType, ApplicationCommandOptionType, ComponentType, TextInputStyle } from 'discord-api-types/v10';
import { getMessage, botPlayers, evalInteraction, getCommandOption, buildActionRow } from './src/util.js';
import rockpaperscissors from './src/minigames/rockpaperscissors.js';
import tictactoe from './src/minigames/tictactoe.js';
import connectfour from './src/minigames/connectfour.js';
import dontgetangry from './src/minigames/dontgetangry.js';
import chess from './src/minigames/chess.js';

const PUBLIC_KEY = ( process.env.key ? await subtle.importKey('raw', Buffer.from(process.env.key, 'hex'), 'Ed25519', true, ['verify']).catch(console.log) : null );

const server = createServer( (req, res) => {
	let signature = req.headers['x-signature-ed25519'];
	let timestamp = req.headers['x-signature-timestamp'];
	if ( !PUBLIC_KEY || !signature || !timestamp || req.method !== 'POST' || req.url !== process.env.interactions_path ) {
		res.statusCode = 401;
		return res.end();
	}

	let body = [];
	req.on( 'data', chunk => {
		body.push(chunk);
	} );
	req.on( 'error', () => {
		console.log( error );
		res.end('error');
	} );
	return req.on( 'end', async () => {
		var rawBody = Buffer.concat(body).toString();
		try {
			if ( !await subtle.verify('Ed25519', PUBLIC_KEY, Buffer.from(signature, 'hex'), Buffer.from(timestamp + rawBody)) ) {
				res.statusCode = 401;
				return res.end();
			}
		}
		catch ( verifyerror ) {
			console.log( verifyerror );
			res.statusCode = 401;
			return res.end();
		}
		try {
			let response = JSON.stringify( interactionCreate( JSON.parse(rawBody) ) );
			res.writeHead(200, {
				'Content-Length': Buffer.byteLength(response),
				'Content-Type': 'application/json'
			});
			res.write( response );
			res.end();
		}
		catch ( jsonerror ) {
			console.log( jsonerror );
			res.statusCode = 500;
			return res.end();
		}
	} );
} );

server.listen( process.env.server_port, process.env.server_hostname, () => {
	console.log( `- Rusty Minigames: Server running at http://${process.env.server_hostname}:${process.env.server_port}/` );
} );

/**
 * @param {import('discord-api-types/v10').APIApplicationCommandInteractionDataOption[]} options 
 * @returns {String}
 */
function logChatInputOptions(options) {
	if ( !options?.length ) return '';
	return options.map( option => {
		if ( option.type === ApplicationCommandOptionType.Subcommand || option.type === ApplicationCommandOptionType.SubcommandGroup ) {
			return option.name + ' ' + logChatInputOptions(option.options);
		}
		return option.name + ':' + option.value;
	} ).join(' ') ?? '';
}

/**
 * Handle received Discord interactions
 * @param {import('discord-api-types/v10').APIInteraction} interaction 
 * @returns {import('discord-api-types/v10').APIInteractionResponseUpdateMessage|import('discord-api-types/v10').APIInteractionResponseChannelMessageWithSource}
 */
function interactionCreate(interaction) {
	/** @type {Partial<import('discord-api-types/v10').APIInteractionResponseUpdateMessage|import('discord-api-types/v10').APIInteractionResponseChannelMessageWithSource>} */
	var result = {
		data: {
			flags: MessageFlags.Ephemeral,
			allowed_mentions: {
				parse: []
			}
		}
	};
	switch ( interaction.type ) {
		case InteractionType.Ping: {
			result.type = InteractionResponseType.Pong;
			break;
		}
		case InteractionType.ApplicationCommand: {
			if ( interaction.data.type !== ApplicationCommandType.ChatInput ) break;
			interaction.user ??= interaction.member?.user;
			console.log( ( interaction.guild_id ?? '@' + interaction.user.id ) + ': Slash: /' + interaction.data.name + ' ' + logChatInputOptions(interaction.data.options) );
			switch ( interaction.data.name ) {
				case 'rockpaperscissors':
					result = rockpaperscissors.slash(interaction);
					break;
				case 'tictactoe':
					result = tictactoe.slash(interaction);
					break;
				case 'connectfour':
					result = connectfour.slash(interaction);
					break;
				case 'mensch-aergere-dich-nicht':
					result = dontgetangry.slash(interaction);
					break;
				case 'chess':
					result = chess.slash(interaction);
					break;
				case 'imabot': { // /eval code:updateApplicationCommand('imabot')
					result.type = InteractionResponseType.ChannelMessageWithSource;
					result.data.content = '🤖 ';
					if ( botPlayers.has(interaction.user.id) ) {
						botPlayers.delete(interaction.user.id);
						result.data.content += getMessage(interaction.locale, 'imabot_disable') + '\n';
						result.data.content += getMessage(interaction.locale, 'imabot_disable_note');
					}
					else {
						botPlayers.add(interaction.user.id);
						result.data.content += getMessage(interaction.locale, 'imabot_enable') + '\n';
						result.data.content += getMessage(interaction.locale, 'imabot_enable_note') + '\n';
						result.data.content += getMessage(interaction.locale, 'imabot_supported') + '\n';
						result.data.content += '- ' + getMessage(interaction.locale, 'dontgetangry');
					}
					break;
				}
				case 'eval': { // /eval code:updateApplicationCommand('eval', '464084451165732868')
					if ( interaction.user.id !== process.env.owner ) break;
					/** @type {String?} */
					let text = getCommandOption(interaction, 'code')?.value;
					if ( text ) {
						setTimeout( evalInteraction, 1, interaction, text ).unref();
						result.type = InteractionResponseType.DeferredChannelMessageWithSource;
						break;
					}
					result.type = InteractionResponseType.Modal;
					result.data = {
						custom_id: 'eval',
						title: 'Evaluate JS',
						components: [ buildActionRow( {
							type: ComponentType.TextInput,
							custom_id: 'code',
							style: TextInputStyle.Paragraph,
							label: 'Code to execute',
							required: true
						} ) ]
					};
				}
			}
			break;
		}
		case InteractionType.ModalSubmit: {
			if ( interaction.data.custom_id !== 'eval' ) break;
			let text = interaction.data.components[0]?.components.find( component => component.custom_id === 'code' )?.value;
			if ( text ) {
				setTimeout( evalInteraction, 1, interaction, text ).unref();
				result.type = InteractionResponseType.DeferredChannelMessageWithSource;
				break;
			}
			result.type = InteractionResponseType.ChannelMessageWithSource;
			result.data.content = 'No text provided';
			break;
		}
		case InteractionType.MessageComponent: {
			if ( interaction.data.component_type !== ComponentType.Button ) break;
			interaction.user ??= interaction.member?.user;
			console.log( ( interaction.guild_id ?? '@' + interaction.user.id ) + ': Button: ' + interaction.data.custom_id );
			if ( !interaction.message.content ) break;
			let playerList = interaction.message.content.split('\n\n')[0].match(/(?<=<@!?)\d+(?=>)/g)?.slice(0, 7) ?? [];
			if ( !playerList[0] ) break;
			if ( !playerList[1] && interaction.user.id !== playerList[0] ) playerList[1] = interaction.user.id;
			if ( interaction.data.custom_id === 'dontgetangry_join' ) {
				result = dontgetangry.join(interaction, playerList);
				break;
			}
			if ( !playerList.includes( interaction.user.id ) ) {
				result.type = InteractionResponseType.ChannelMessageWithSource;
				result.data.content = getMessage(interaction.locale, 'error_not_a_player');
				break;
			}
			switch ( interaction.data.custom_id.split('_')[0] ) {
				case 'rockpaperscissors':
					result = rockpaperscissors.button(interaction, playerList);
					break;
				case 'tictactoe':
					result = tictactoe.button(interaction, playerList);
					break;
				case 'connectfour':
					result = connectfour.button(interaction, playerList);
					break;
				case 'dontgetangry':
					result = dontgetangry.button(interaction, playerList);
					break;
				case 'chess':
					result = chess.button(interaction, playerList);
					break;
			}
			break;
		}
	}
	if ( !result.type ) {
		result.type = InteractionResponseType.ChannelMessageWithSource;
		result.data.content = getMessage(interaction.locale, 'error_unknown_interaction');
	}
	return result;
}

process.on( 'warning', warning => {
	if ( warning?.name === 'ExperimentalWarning' ) return;
	console.log(`- Warning: ${warning}`);
} );

/**
 * End the process gracefully.
 * @param {NodeJS.Signals} signal - The signal received.
 */
function graceful(signal) {
	console.log(signal);
	server.close( () => {
		console.log( '- ' + signal + ': Closed the server.' );
		process.exit(0);
	} );
}

process.on( 'SIGHUP', graceful );
process.on( 'SIGINT', graceful );
process.on( 'SIGTERM', graceful );
process.on( 'SIGINT SIGTERM', graceful );