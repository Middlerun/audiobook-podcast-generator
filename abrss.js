#!/usr/bin/env node

const path = require('path')
const fs = require('fs')



const usage =
`Usage: ./abrss.js config.json

Example config format:

{
  "title": "The Lies of Locke Lamora",
  "description": "Book One of the Gentleman Bastard series by Scott Lynch",
  "link": "https://en.wikipedia.org/wiki/The_Lies_of_Locke_Lamora",
  "urlRoot": "http://www.example.com/podcast/",
  "inputFileDir": "./tloll",
  "fileRegex": "^(.+)\\.mp3$",
  "imageFilename": "The Lies of Locke Lamora.jpg",
  "audioFileType": "audio/mpeg"
}

Note that files should be named such that they are in the desired order when listed by filename.`

const [ nodeExec, scriptFilename, configFile ] = process.argv

if (!configFile) {
  console.log(usage)
  process.exit()
}

let config
let episodes
let fileRegex
let fileDirPath

const now = new Date()

// Get config file
try {
  if (!configFile) throw new Error('No filename given')
  const configFilePath = path.join('./', configFile)
  const configContents = fs.readFileSync(configFilePath)
  config = JSON.parse(configContents)
  fileRegex = new RegExp(config.fileRegex)
  fileDirPath = path.join('./', config.inputFileDir)

  // TODO: validate config
} catch (e) {
  console.error('Failed to read config file: ' + e.message)
}

function mapEpisode(fileName, i) {
  // TODO: maybe get file metadata using https://www.npmjs.com/package/music-metadata
  const fileNameParts = fileRegex.exec(fileName)
  const title = escapeXml(fileNameParts[1])
  const url = config.urlRoot + fileName
  const { size } = fs.statSync(path.join(fileDirPath, fileName))
  const pubDate = new Date(now.getTime() - i * 60000)
  return {
    title,
    url,
    size,
    pubDate,
  }
}

// Get file list
try {
  let allFiles = fs.readdirSync(fileDirPath)
  allFiles.reverse()
  episodes = allFiles
    .filter(name => name.match(fileRegex))
    .map(mapEpisode)
} catch (e) {
  console.error('Failed to get list of files: ' + e.message)
}

const xml = `<rss version="2.0">
  <channel>
    <title>${config.title}</title>
    <description>${config.description}</description>
    <link>${config.link}</link>
    <image>
      <url>${config.urlRoot + config.imageFilename}</url>
      <title>${config.title}</title>
      <link>${config.link}</link>
    </image>
    <language>en-us</language>
    <copyright>Copyright ${now.getFullYear()}</copyright>
    <lastBuildDate>${pubDate(now)}</lastBuildDate>
    <pubDate>${pubDate(now)}</pubDate>
    <docs>http://blogs.law.harvard.edu/tech/rss</docs>
    <webMaster>whoever@example.com</webMaster>

    ${episodes.map((episode, i) => `
      <item>
        <title>${episode.title}</title>
        <guid>${episode.url}</guid>
        <description></description>
        <enclosure url="${episode.url}" length="${episode.size}" type="${config.audioFileType}"/>
        <category>Podcasts</category>
        <pubDate>${pubDate(episode.pubDate)}</pubDate>
      </item>
    `).join('')}
  </channel>
</rss>`

console.log(xml)

// Taken from https://gist.github.com/samhernandez/5260558
function pubDate(date) {
  var pieces     = date.toString().split(' '),
      offsetTime = pieces[5].match(/[-+]\d{4}/),
      offset     = (offsetTime) ? offsetTime : pieces[5],
      parts      = [
        pieces[0] + ',',
        pieces[2],
        pieces[1],
        pieces[3],
        pieces[4],
        offset
      ]

  return parts.join(' ')
}

// Taken from https://stackoverflow.com/a/4835406
function escapeXml(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }

  return text.replace(/[&<>"']/g, function(m) { return map[m]; })
}