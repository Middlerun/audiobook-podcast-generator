# Audiobook podcast RSS generator

This tool can be used to generate podcast feeds for groups of audio files, such as:

- audiobooks
- lectures
- old public-domain radio shows

You can host the resulting XML file (along with the audio files) somewhere and subscribe to it in your podcast app.

## Usage

Create a config file called something like `config.json`, then run:

```
./abrss.js config.json > feed.xml
```

Example config format:

```
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
```

Note that files should be named such that they are in the desired order when listed by filename. The script will automatically timestamp the episodes so that the chronological order matches this.

The files and image must be hosted in the location specified by `urlRoot`.

You can use a more complex regex for `fileRegex` if you want. The episode title will be taken from the first capture group.