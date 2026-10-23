// Static actual implementation ownership; no UI or inputs.
export const COMPLETION_SOURCES=[
  ['gs8',[]],
  ['marine-signals',['https://github.com/dzangolab/marine-signal-flags','https://msi.nga.mil/Publications/ICOS']],
  ['semaphore-batch',['https://github.com/kfarnung/puzzle-lib']],
  ['prussian',['https://github.com/GCWizard/GCWizard']],
  [
    "byte-codecs",
    [
      "https://github.com/Equim-chan/base91",
      "https://github.com/qntm/base65536", "https://github.com/jikkai/aaencode-cli", "https://github.com/blaiprat/grunt-jjencode", "https://github.com/justjake/quickjs-emscripten"
    ]
  ],
  [
    "integer-codecs",
    []
  ],
  [
    "keyboard-extra",
    ["https://github.com/simple-keyboard/simple-keyboard-layouts"]
  ],
  [
    "t9",
    [
      "https://github.com/philippica/cipher_machine"
    ]
  ],
  [
    "color-codes",
    []
  ],
  [
    "nato",
    []
  ],
  [
    "braille-languages",
    [
      "https://github.com/liblouis/liblouis",
      "https://github.com/liblouis/liblouis-js"
    ]
  ],
  [
    "barcode-generate",
    [
      "https://github.com/metafloor/bwip-js"
    ]
  ],
  [
    "virtual-keyboard",
    [
      "https://github.com/hodgef/simple-keyboard",
      "https://github.com/simple-keyboard/simple-keyboard-layouts"
    ]
  ],
  [
    "origami",
    [
      "https://github.com/amandaghassaei/OrigamiSimulator",
      "https://github.com/edemaine/fold"
    ]
  ]
];
// Only public implementation identifiers cross the source bridge.
export function completionImplementationSources(name,{codec='base91',direction='encode',mode='coordinates'}={}){
 if(name==='keyboard-extra')return mode.startsWith('layout-')?['https://github.com/simple-keyboard/simple-keyboard-layouts']:[];
 if(name!=='byte-codecs')return null;
 const sources={base91:['https://github.com/Equim-chan/base91'],base65536:['https://github.com/qntm/base65536'],aaencode:['https://github.com/jikkai/aaencode-cli'],jjencode:['https://github.com/blaiprat/grunt-jjencode']};
 const urls=[...(sources[codec]||[])];
 if(['aaencode','jjencode'].includes(codec)&&direction==='decode')urls.push('https://github.com/justjake/quickjs-emscripten');
 return urls;
}
