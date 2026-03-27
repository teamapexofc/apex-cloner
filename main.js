const { Client } = require('discord.js-selfbot-v11');
const { prompt } = require('enquirer');
const cliProgress = require('cli-progress');
const figlet = require('figlet');
const gradient = require('gradient-string');
const colors = require('colors');

const client = new Client();

const CONFIG = {
    version: '2.0.0',
    author: 'ApeX Development',
    github: 'github.com/apex-development',
    delays: {
        role: 500,
        channel: 800,
        emoji: 1000
    }
};

const apexGradient = gradient.rainbow;

function displayBanner() {
    console.clear();
    const banner = figlet.textSync('ApeX Cloner', {
        font: 'ANSI Shadow',
        horizontalLayout: 'fitted'
    });
    console.log(apexGradient(banner));
    console.log('');
    console.log(colors.magenta('━'.repeat(70)));
    console.log(`   ${colors.gray('Version:')} ${colors.cyan(CONFIG.version)}   ${colors.gray('|')}   ${colors.gray('By:')} ${colors.magenta(CONFIG.author)}   ${colors.gray('|')}   ${colors.gray('GitHub:')} ${colors.blue(CONFIG.github)}`);
    console.log(colors.magenta('━'.repeat(70)));
    console.log('');
}

function log(message, type = 'info') {
    const timestamp = colors.gray(`[${new Date().toLocaleTimeString()}]`);
    const types = {
        success: { symbol: '✓', color: colors.green },
        warning: { symbol: '⚠', color: colors.yellow },
        error: { symbol: '✗', color: colors.red },
        info: { symbol: '→', color: colors.cyan },
        progress: { symbol: '◆', color: colors.magenta }
    };
    const { symbol, color } = types[type] || types.info;
    console.log(`${timestamp} ${color(`[${symbol}]`)} ${message}`);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createProgressBar(name) {
    return new cliProgress.SingleBar({
        format: `   ${colors.cyan(name)} |${colors.cyan('{bar}')}| {percentage}% | {value}/{total}`,
        barCompleteChar: '█',
        barIncompleteChar: '░',
        hideCursor: true
    });
}

async function getConfig() {
    displayBanner();
    
    try {
        const config = await prompt([
            {
                type: 'password',
                name: 'token',
                message: colors.cyan('Enter your Discord token'),
                validate: value => value.length > 50 ? true : 'Token seems too short. Please check again.'
            },
            {
                type: 'input',
                name: 'original',
                message: colors.cyan('Enter the source server ID (to clone from)'),
                validate: value => /^\d{17,19}$/.test(value) ? true : 'Invalid server ID format'
            },
            {
                type: 'input',
                name: 'target',
                message: colors.cyan('Enter the target server ID (to clone to)'),
                validate: value => /^\d{17,19}$/.test(value) ? true : 'Invalid server ID format'
            },
            {
                type: 'confirm',
                name: 'cloneIcon',
                message: colors.cyan('Clone server icon?'),
                initial: true
            },
            {
                type: 'confirm',
                name: 'cloneName',
                message: colors.cyan('Clone server name?'),
                initial: true
            }
        ]);
        return config;
    } catch (err) {
        if (err.message && err.message.includes('cancelled')) {
            log('Operation cancelled by user', 'warning');
            process.exit(0);
        }
        throw err;
    }
}

async function deleteGuildContent(guild) {
    log(`Cleaning target server: ${colors.yellow(guild.name)}`, 'progress');
    
    const channels = guild.channels.array();
    const roles = guild.roles.filter(r => r.id !== guild.id && !r.managed).array();
    
    if (channels.length > 0) {
        const channelBar = createProgressBar('Deleting Channels');
        channelBar.start(channels.length, 0);
        
        for (const channel of channels) {
            try {
                await channel.delete();
            } catch (e) {}
            channelBar.increment();
            await delay(100);
        }
        channelBar.stop();
    }
    
    if (roles.length > 0) {
        const roleBar = createProgressBar('Deleting Roles   ');
        roleBar.start(roles.length, 0);
        
        for (const role of roles) {
            try {
                await role.delete();
            } catch (e) {}
            roleBar.increment();
            await delay(100);
        }
        roleBar.stop();
    }
    
    console.log('');
}

async function cloneRoles(source, target) {
    const roles = source.roles
        .filter(r => r.id !== source.id)
        .sort((a, b) => a.position - b.position)
        .array();
    
    if (roles.length === 0) return new Map();
    
    log(`Cloning ${colors.yellow(roles.length)} roles...`, 'progress');
    const roleBar = createProgressBar('Creating Roles   ');
    roleBar.start(roles.length, 0);
    
    const roleMap = new Map();
    
    for (const role of roles) {
        try {
            const newRole = await target.createRole({
                name: role.name,
                color: role.color,
                hoist: role.hoist,
                permissions: role.permissions,
                mentionable: role.mentionable
            });
            roleMap.set(role.id, newRole.id);
        } catch (e) {}
        roleBar.increment();
        await delay(CONFIG.delays.role);
    }
    roleBar.stop();

    // Set positions to match source order
    log('Setting role positions...', 'progress');
    const posBar = createProgressBar('Setting Positions');
    posBar.start(roles.length, 0);
    for (const role of roles) {
        const targetRoleId = roleMap.get(role.id);
        if (targetRoleId) {
            try {
                const targetRole = target.roles.get(targetRoleId);
                await targetRole.setPosition(role.position);
            } catch (e) {
                log(`Failed to set position for ${role.name}`, 'warning');
            }
        }
        posBar.increment();
        await delay(200);
    }
    posBar.stop();
    console.log('');
    
    return roleMap;
}



function mapPermissions(overwrites, source, target, roleMap) {
    return overwrites.map(overwrite => {
        let id;
        if (overwrite.type === 'role') {
            if (overwrite.id === source.id) {
                id = target.id;
            } else {
                id = roleMap.get(overwrite.id);
            }
        } else {
            id = overwrite.id;
        }
        
        if (!id) return null;
        
        return {
            id: id,
            allow: overwrite.allow || 0,
            deny: overwrite.deny || 0
        };
    }).filter(p => p !== null);
}

async function cloneChannels(source, target, roleMap) {
    const categories = source.channels
        .filter(c => c.type === 'category')
        .sort((a, b) => a.position - b.position)
        .array();
    
    const textChannels = source.channels
        .filter(c => c.type === 'text')
        .sort((a, b) => a.position - b.position)
        .array();
    
    const voiceChannels = source.channels
        .filter(c => c.type === 'voice')
        .sort((a, b) => a.position - b.position)
        .array();
    
    const totalChannels = categories.length + textChannels.length + voiceChannels.length;
    if (totalChannels === 0) return;
    
    log(`Cloning ${colors.yellow(totalChannels)} channels...`, 'progress');
    const channelBar = createProgressBar('Creating Channels');
    channelBar.start(totalChannels, 0);
    
    const categoryMap = new Map();
    
    for (const category of categories) {
        try {
            const permissions = mapPermissions(
                category.permissionOverwrites.array(),
                source, target, roleMap
            );
            
            const newCategory = await target.createChannel(category.name, 'category', permissions);
            categoryMap.set(category.id, newCategory.id);
        } catch (e) {
            log(`Failed to create category: ${category.name}`, 'warning');
        }
        channelBar.increment();
        await delay(CONFIG.delays.channel);
    }
    
    for (const channel of textChannels) {
        try {
            const permissions = mapPermissions(
                channel.permissionOverwrites.array(),
                source, target, roleMap
            );
            
            const newChannel = await target.createChannel(channel.name, 'text', permissions);
            
            if (channel.parent && categoryMap.has(channel.parent.id)) {
                await newChannel.setParent(categoryMap.get(channel.parent.id));
            }
            
            if (channel.topic) {
                await newChannel.setTopic(channel.topic);
            }
            
            if (channel.nsfw) {
                await newChannel.setNSFW(true);
            }
        } catch (e) {
            log(`Failed to create channel: ${channel.name}`, 'warning');
        }
        channelBar.increment();
        await delay(CONFIG.delays.channel);
    }
    
    for (const channel of voiceChannels) {
        try {
            const permissions = mapPermissions(
                channel.permissionOverwrites.array(),
                source, target, roleMap
            );
            
            const newChannel = await target.createChannel(channel.name, 'voice', permissions);
            
            if (channel.parent && categoryMap.has(channel.parent.id)) {
                await newChannel.setParent(categoryMap.get(channel.parent.id));
            }
            
            if (channel.bitrate) {
                await newChannel.setBitrate(Math.min(channel.bitrate, 96000));
            }
            
            if (channel.userLimit) {
                await newChannel.setUserLimit(channel.userLimit);
            }
        } catch (e) {
            log(`Failed to create voice channel: ${channel.name}`, 'warning');
        }
        channelBar.increment();
        await delay(CONFIG.delays.channel);
    }
    
    channelBar.stop();
    console.log('');
}

async function cloneServer(source, target, options) {
    const startTime = Date.now();
    
    displayBanner();
    log(`Starting clone operation...`, 'info');
    log(`Source: ${colors.green(source.name)} (${source.id})`, 'info');
    log(`Target: ${colors.yellow(target.name)} (${target.id})`, 'info');
    console.log('');
    
    await deleteGuildContent(target);
    
    if (options.cloneIcon && source.iconURL) {
        try {
            await target.setIcon(source.iconURL);
            log('Server icon cloned', 'success');
        } catch (e) {
            log('Failed to clone server icon', 'warning');
        }
    }
    
    if (options.cloneName) {
        try {
            await target.setName(source.name);
            log('Server name cloned', 'success');
        } catch (e) {
            log('Failed to clone server name', 'warning');
        }
    }
    
    console.log('');
    
    const roleMap = await cloneRoles(source, target);
    await cloneChannels(source, target, roleMap);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(colors.magenta('━'.repeat(70)));
    console.log('');
    log(`Clone completed successfully in ${colors.cyan(duration + 's')}!`, 'success');
    console.log('');
    
    const stats = {
        roles: source.roles.size - 1,
        channels: source.channels.size
    };
    
    console.log(`   ${colors.gray('Stats:')} ${colors.cyan(stats.roles)} roles | ${colors.cyan(stats.channels)} channels`);
    console.log('');
    console.log(colors.magenta('━'.repeat(70)));
    console.log(`   ${colors.magenta('Thank you for using ApeX Cloner!')} ${colors.gray('- Subscribe to ApeX Development on YouTube')}`);
    console.log(colors.magenta('━'.repeat(70)));
}

async function run() {
    try {
        const config = await getConfig();
        const { token, original, target, cloneIcon, cloneName } = config;
        
        displayBanner();
        log('Connecting to Discord...', 'info');
        
        client.on('ready', async () => {
            const sourceGuild = client.guilds.get(original);
            const targetGuild = client.guilds.get(target);
            
            if (!sourceGuild) {
                log(`Source server not found! Make sure you're a member of the server.`, 'error');
                process.exit(1);
            }
            
            if (!targetGuild) {
                log(`Target server not found! Make sure you're a member and have admin permissions.`, 'error');
                process.exit(1);
            }
            
            log(`Logged in as ${colors.cyan(client.user.tag)}`, 'success');
            console.log('');
            
            await cloneServer(sourceGuild, targetGuild, { cloneIcon, cloneName });
            
            setTimeout(() => process.exit(0), 2000);
        });
        
        client.on('error', (error) => {
            log(`Discord error: ${error.message}`, 'error');
        });
        
        await client.login(token.replace(/"/g, ''));
        
    } catch (error) {
        if (error.message && error.message.includes('Incorrect login')) {
            displayBanner();
            log('Invalid token! Please check your Discord token and try again.', 'error');
        } else {
            log(`Error: ${error.message}`, 'error');
        }
        process.exit(1);
    }
}

run();
