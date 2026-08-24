/**
 * WebAR Multi-Building Configuration
 * 
 * To add a new 3D building:
 * 1. Drop your .glb file into the "assets/" folder (e.g. assets/taj_mahal.glb)
 * 2. Add an entry into the BUILDINGS object below!
 */

window.BUILDINGS = [
  {
    id: "colosseum",
    name: {
      en: "Roman Colosseum",
      zh: "罗马斗兽场"
    },
    subtitle: {
      en: "Rome, Italy • Built 70-80 AD",
      zh: "意大利罗马 • 建于公元 70-80 年"
    },
    modelPath: "assets/colosseum.glb",
    fallbackUrl: "assets/colosseum.glb",
    skyboxColor: "#111827",
    hotspots: [
      {
        id: "arena",
        slot: "hotspot-arena",
        position: "0m 0.2m 0m",
        normal: "0m 1m 0m",
        title: {
          en: "The Arena Floor",
          zh: "表演场地面 (Arena)"
        },
        description: {
          en: "• Covered with sand (harena in Latin) to absorb blood.\n• Wooden floor supported gladiator battles for 80,000 spectators.\n• Below lay the complex Hypogeum underground network.",
          zh: "• 角斗场地面铺满沙子（拉丁语 harena），用以吸收血迹。\n• 木质地板可承载8万名观众注视下的激烈角斗。\n• 地板下方隐藏着庞大的 Hypogeum 地下机关网络。"
        },
        mediaType: "image",
        mediaUrl: "assets/colosseum_arena.png",
        images: ["assets/colosseum_arena.png"],
        audioText: {
          en: "Welcome to the Arena Floor of the Roman Colosseum. Gladiators fought here before up to 80,000 spectators. The floor was made of wood covered in sand.",
          zh: "欢迎来到罗马斗兽场的表演场地面。角斗士在此与猛兽或同伴搏斗，容纳多达8万名观众。地板为铺满沙子的木板。"
        }
      },
      {
        id: "hypogeum",
        slot: "hotspot-hypogeum",
        position: "0.2m 0.05m -0.1m",
        normal: "0m 1m 0m",
        title: {
          en: "The Hypogeum Underground",
          zh: "地下室与升降机 (Hypogeum)"
        },
        description: {
          en: "• 2-story subterranean maze of tunnels and cages.\n• 80 vertical shafts with pulley elevators for wild animals.\n• Allowed gladiators and beasts to make dramatic surprise entrances!",
          zh: "• 两层深的地下迷宫通道与兽笼设施。\n• 80个垂直井道和滑轮升降梯装载猛兽。\n• 可将角斗士和野兽直接送上表演场地呈现震撼登场！"
        },
        mediaType: "image",
        mediaUrl: "assets/b1_p2_1.jpeg",
        images: ["assets/b1_p2_1.jpeg", "assets/b1_p2_2.jpeg"],
        audioText: {
          en: "The Hypogeum was the secret underground engine of the Colosseum. It housed wild animals, gladiators, and 80 pulley elevators that staged dramatic surprise entrances.",
          zh: "Hypogeum 是斗兽场的地下机关核心，关押野兽和角斗士。利用80台滑轮升降机，能实现惊险的舞台效果与野兽突袭。"
        }
      },
      {
        id: "emperor-box",
        slot: "hotspot-emperor",
        position: "-0.4m 0.4m 0m",
        normal: "1m 0m 0m",
        title: {
          en: "Emperor's Box & Podium",
          zh: "皇帝包厢与贵宾席"
        },
        description: {
          en: "• Prime viewing boxes reserved for the Emperor, Vestal Virgins & Senators.\n• Provided unmatched 360-degree arena visibility.\n• Emperor used hand gestures to decide gladiator life or death.",
          zh: "• 专门留给罗马皇帝、维斯塔贞女和元老院议员的尊贵席位。\n• 提供全场最佳的 360 度视角。\n• 皇帝通过手势即刻决定败者角斗士的生死。"
        },
        mediaType: "image",
        mediaUrl: "assets/colosseum_arena.png",
        images: ["assets/colosseum_arena.png"],
        audioText: {
          en: "Located at the prime viewing spot, the Emperor's Box seated the ruler of Rome. The Emperor used hand gestures to decide whether a defeated gladiator lived or died.",
          zh: "皇帝包厢位于最佳观景位置。罗马皇帝在此就座，并通过手势决定失败的角斗士是否能生还。"
        }
      },
      {
        id: "arches",
        slot: "hotspot-arches",
        position: "0.5m 0.6m 0.2m",
        normal: "0m 0m 1m",
        title: {
          en: "Outer Archways & Velarium",
          zh: "外墙拱门与防晒天篷"
        },
        description: {
          en: "• 80 numbered arches allowed 50,000 spectators to enter in 15 mins.\n• Roman Navy sailors operated a colossal retractable canvas roof (Velarium).\n• Shielded crowd from scorching sun and rain.",
          zh: "• 80个编号外墙拱门能让5万名观众在15分钟内快速入场。\n• 罗马水手在顶部操纵巨大的可收缩帆布顶棚（Velarium）。\n• 为全场观众挡雨和抵御暴晒。"
        },
        mediaType: "image",
        mediaUrl: "assets/colosseum_hypogeum.png",
        images: ["assets/colosseum_hypogeum.png"],
        audioText: {
          en: "The exterior boasts 80 entrance arches. Sailors from the Roman Navy were stationed at the top to operate a colossal retractable canvas roof called the Velarium.",
          zh: "斗兽场外墙拥有80个编号拱门。罗马水手在顶部操纵巨大的可收缩帆布顶棚（Velarium），为观众挡雨遮阳。"
        }
      }
    ],
    quiz: [
      {
        question: {
          en: "What was the underground tunnel network beneath the Colosseum called?",
          zh: "罗马斗兽场地下复杂的通道与升降机系统叫什么？"
        },
        options: [
          { en: "Hypogeum", zh: "Hypogeum 地下室", correct: true },
          { en: "Parthenon", zh: "Parthenon 帕特农", correct: false },
          { en: "Forum", zh: "Forum 古罗马广场", correct: false },
          { en: "Pantheon", zh: "Pantheon 万神殿", correct: false }
        ]
      },
      {
        question: {
          en: "How did spectators protect themselves from intense Roman sunlight?",
          zh: "观众如何躲避罗马炎热的太阳暴晒？"
        },
        options: [
          { en: "Glass windows", zh: "玻璃窗", correct: false },
          { en: "Retractable canvas roof (Velarium)", zh: "水手操作的帆布天篷 (Velarium)", correct: true },
          { en: "Stone roofs", zh: "石制拱顶", correct: false },
          { en: "Metal umbrellas", zh: "金属遮阳伞", correct: false }
        ]
      }
    ]
  },
  {
    id: "parthenon",
    name: {
      en: "Parthenon",
      zh: "帕特农神庙"
    },
    subtitle: {
      en: "Athens, Greece • Built 447-432 BC",
      zh: "希腊雅典 • 建于公元前 447-432 年"
    },
    modelPath: "assets/parthenon.glb",
    fallbackUrl: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/Lantern/glTF-Binary/Lantern.glb",
    skyboxColor: "#0f172a",
    hotspots: [
      {
        id: "columns",
        slot: "hotspot-columns",
        position: "0m 0.5m 0.5m",
        normal: "0m 0m 1m",
        title: {
          en: "Doric Columns & Optical Illusion",
          zh: "多立克柱式与视觉幻象"
        },
        description: {
          en: "The columns swell slightly in the middle (entasis) and lean inwards. This optical correction makes them appear perfectly straight to human eyes!",
          zh: "柱子中间微凸（柱身渐扩），向内倾斜。这种光学矫正让原本弯曲的视觉效果看起来绝对挺拔。"
        },
        mediaType: "image",
        mediaUrl: "assets/parthenon_columns.png",
        images: ["assets/b2_p1_1.jpg", "assets/b2_p1_2.jpg", "assets/parthenon_columns.png"],
        audioText: {
          en: "The Parthenon's Doric columns use optical illusions called entasis to look completely straight from a distance.",
          zh: "帕特农神庙的多立克柱采用了称为柱身渐扩的光学错觉设计，使远观时柱子看起来完美垂直。"
        }
      },
      {
        id: "athena-statue",
        slot: "hotspot-athena",
        position: "0m 0.4m 0m",
        normal: "0m 1m 0m",
        title: {
          en: "Chryselephantine Statue of Athena",
          zh: "雅典娜神像"
        },
        description: {
          en: "A 12-meter tall statue of Athena Parthenos made of ivory and over 1,000 kg of pure gold stood inside the cella chamber.",
          zh: "主殿内曾供奉一座高12米的雅典娜巨像，由象牙和超过1,000公斤的纯金打造。"
        },
        mediaType: "image",
        mediaUrl: "assets/parthenon_columns.png",
        images: ["assets/b2_p2_1.jpg", "assets/parthenon_columns.png"],
        audioText: {
          en: "Inside the inner chamber stood a 12-meter tall statue of Athena covered in pure gold and ivory.",
          zh: "主殿中央耸立着一座12米高的雅典娜巨像，覆盖纯金与象牙。"
        }
      }
    ],
    quiz: [
      {
        question: {
          en: "Which architectural order characterizes the main columns of the Parthenon?",
          zh: "帕特农神庙的主要立柱属于哪种柱式风格？"
        },
        options: [
          { en: "Doric Order", zh: "多立克柱式 (Doric)", correct: true },
          { en: "Ionic Order", zh: "爱奥尼柱式 (Ionic)", correct: false },
          { en: "Corinthian Order", zh: "哥林多柱式 (Corinthian)", correct: false },
          { en: "Tuscan Order", zh: "塔斯干柱式", correct: false }
        ]
      }
    ]
  },
  {
    id: "pyramid",
    name: {
      en: "Great Pyramid of Giza",
      zh: "吉萨大金字塔"
    },
    subtitle: {
      en: "El Giza, Egypt • Built c. 2560 BC",
      zh: "埃及吉萨 • 建于公元前 2560 年左右"
    },
    modelPath: "assets/pyramid.glb",
    fallbackUrl: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb",
    skyboxColor: "#1e1b4b",
    hotspots: [
      {
        id: "casing",
        slot: "hotspot-casing",
        position: "0m 0.6m 0m",
        normal: "0m 1m 0m",
        title: {
          en: "Polished Tura Limestone Casing",
          zh: "打磨石灰石外壳"
        },
        description: {
          en: "Originally, the pyramid was covered in highly polished white limestone casing stones that reflected sunlight like a giant mirror.",
          zh: "金字塔最初覆盖着高度打磨的白色图拉石灰石外壳，像巨大镜子般反射耀眼阳光。"
        },
        mediaType: "image",
        mediaUrl: "assets/pyramid_casing.png",
        images: ["assets/b3_p1_1.jpg", "assets/pyramid_casing.png"],
        audioText: {
          en: "Originally, the Great Pyramid was covered in smooth white limestone casing stones, making it shine dazzingly under the desert sun.",
          zh: "大金字塔最初包覆着平整光滑的白色石灰石外壳，在沙漠阳光下宛如巨型明镜。"
        }
      },
      {
        id: "kings-chamber",
        slot: "hotspot-kings-chamber",
        position: "0m 0.3m 0m",
        normal: "0m 1m 0m",
        title: {
          en: "The King's Chamber & Sarcophagus",
          zh: "法老墓室与花岗岩石棺"
        },
        description: {
          en: "Built deep inside from massive red granite blocks imported from Aswan. It houses Pharaoh Khufu's empty sarcophagus.",
          zh: "墓室深藏于金字塔内部，采用从阿斯旺运来的巨型红花岗岩筑成，安放胡夫法老的石棺。"
        },
        mediaType: "image",
        mediaUrl: "assets/pyramid_casing.png",
        images: ["assets/b3_p2_1.jpg", "assets/pyramid_casing.png"],
        audioText: {
          en: "Deep within lies the King's Chamber, constructed with colossal granite blocks to preserve Pharaoh Khufu.",
          zh: "金字塔核心为法老墓室，由数吨重的巨型花岗岩砌筑，安放胡夫法老的最后归宿。"
        }
      }
    ],
    quiz: [
      {
        question: {
          en: "What material originally made the Great Pyramid shine in the sun?",
          zh: "金字塔最初表面包覆了什么材质使其在阳光下发光？"
        },
        options: [
          { en: "Polished White Limestone", zh: "打磨白色石灰石", correct: true },
          { en: "Pure Gold Leaf", zh: "纯金箔", correct: false },
          { en: "Red Granite", zh: "红花岗岩", correct: false },
          { en: "Bronze Sheets", zh: "青铜板", correct: false }
        ]
      }
    ]
  }
];
