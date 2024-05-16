import { inspect } from 'node:util';
import { readdir, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import gotDefault from 'got';
import { gotSsrf } from 'got-ssrf';
import { ApplicationCommandOptionType, ComponentType, FormattingPatterns, RouteBases, Routes } from 'discord-api-types/v10';
const require = createRequire(import.meta.url);

inspect.defaultOptions = {compact: false, breakLength: Infinity};

globalThis.isDebug = ( process.argv[2] === 'debug' );

/** @type {Map<String, Map<String, String>>} */
const allLangs = new Map();
readdir( './i18n', (error, files) => {
	if ( error ) return error;
	files.filter( file => file.endsWith('.json') ).forEach( file => {
		var translations = require(`../i18n/${file}`);
		var lang = file.slice(0, -5);
		allLangs.set(lang, new Map(Object.entries(translations)));
	} );
} );

/**
 * Get a translated message.
 * @param {import('discord-api-types/v10').LocaleString} locale
 * @param {String} message
 * @param {String[]} args
 * @returns {String}
 */
export function getMessage(locale = 'en-US', message, ...args) {
	let text = allLangs.get(locale)?.get(message) || allLangs.get('en-US')?.get(message) || '⧼' + message + ( args.length ? ': ' + args.join(', ') : '' ) + '⧽';
	for ( let arg of args ) {
		text = text.replace('%s', arg);
	}
	return text;
}

export const got = gotDefault.extend( {
	throwHttpErrors: false,
	timeout: {
		request: 5000
	},
	headers: {
		'user-agent': 'Rusty Minigames/' + ( isDebug ? 'testing' : process.env.npm_package_version ) + ' (Discord; ' + process.env.npm_package_name + ( process.env.invite ? '; ' + process.env.invite : '' ) + ')'
	},
	responseType: 'json'
}, gotSsrf );

/**
 * Update an application command.
 * @param {String} commandName 
 * @param {String?} guildId 
 * @returns {String}
 */
export function updateApplicationCommand(commandName, guildId) {
	if ( !existsSync(`./commands/${commandName}.json`) ) return 'This command does not exist.';
	return got.post( RouteBases.api + ( guildId ? Routes.applicationGuildCommands(process.env.bot, guildId) : Routes.applicationCommands(process.env.bot) ), {
		json: require(`../commands/${commandName}.json`),
		headers: {
			authorization: 'Bot ' + process.env.token
		}
	} ).then( response => {
		return response.body;
	}, error => {
		console.log( `- Error while responding to the interaction: ${error}` );
	} );
}

/**
 * Evaluate JS from chat command.
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction|import('discord-api-types/v10').APIModalSubmitInteraction} interaction 
 * @param {String} text 
 */
export async function evalInteraction(interaction, text) {
	try {
		text = inspect( await eval( text ) );
	} catch ( error ) {
		text = String(error);
	}
	if ( isDebug ) console.log( '--- EVAL START ---\n' + text + '\n--- EVAL END ---' );
	/** @type {import('discord-api-types/v10').APIInteractionResponseCallbackData} */
	let message = {
		content: ( text.length > 1990 ? '✅' : '```js\n' + text + '\n```' ),
		allowed_mentions: {
			parse: []
		}
	}
	updateMessage(interaction, message)
}

/** @type {['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']} */
export const emojiNumberList = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

/** @type {['🥇', '🥈', '🥉', '🏅', '🏅', '🏅']} */
export const emojiMedalList = ['🥇', '🥈', '🥉', '🏅', '🏅', '🏅'];

export const botPlayers = new Set([
	'1239601207694331914', // Rusty Minigames
	'809717142983147552', // Rostiger Bot
	'461189216198590464', // Wiki-Bot
	'432468082175246351', // Wiki-Bot (Test)
	'483003112831975424' // Curious Chicken
]);

export const botPlayedGames = new Set();

/**
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
 * @param {String} optionName 
 * @returns {import('discord-api-types/v10').APIApplicationCommandInteractionDataBasicOption?}
 */
export function getCommandOption(interaction, optionName) {
	return interaction.data.options?.find( option => option.name === optionName );
}

/**
 * @param {import('discord-api-types/v10').APIChatInputApplicationCommandInteraction} interaction 
 * @param {String} optionName 
 * @returns {import('discord-api-types/v10').APIUser?}
 */
export function getCommandUserOption(interaction, optionName) {
	let userOption = getCommandOption(interaction, optionName);
	if ( userOption?.type !== ApplicationCommandOptionType.User ) return null;
	return interaction.data.resolved?.users?.[userOption.value];
}

/**
 * @param {import('discord-api-types/v10').APIButtonComponentWithCustomId[]} components
 * @returns {import('discord-api-types/v10').APIActionRowComponent<import('discord-api-types/v10').APIButtonComponentWithCustomId>}
 */
export function buildActionRow(...components) {
	return {
		type: ComponentType.ActionRow,
		components: components.filter( component => component )
	};
}

/**
 * @param {String} custom_id
 * @param {import('discord-api-types/v10').ButtonStyle} style
 * @param {import('discord-api-types/v10').APIMessageComponentEmoji|String?} emoji
 * @param {String?} label
 * @param {Boolean?} disabled
 * @returns {import('discord-api-types/v10').APIButtonComponentWithCustomId}
 */
export function buildButton(custom_id, style, emoji, label, disabled) {
	if ( typeof emoji === 'string' ) emoji = emoji.startsWith( '<' ) ? emoji.match(FormattingPatterns.StaticEmoji)?.groups : { id: null, name: emoji };
	return {
		type: ComponentType.Button,
		custom_id, style, emoji,
		label, disabled
	}
}

/** 
 * @param {import('discord-api-types/v10').APIInteraction} interaction
 * @param {import('discord-api-types/v10').APIInteractionResponseCallbackData} message
 */
export function updateMessage(interaction, message) {
	if ( !message.components ) message.components = [];
	return got.patch( RouteBases.api + Routes.webhookMessage(interaction.application_id, interaction.token), {
		json: message,
		throwHttpErrors: true
	} ).catch( error => {
		console.log( `- Error while updating to the interaction message: ${error}` );
	} );
}