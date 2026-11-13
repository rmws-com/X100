/**
 * Free-licensed Pokémon photographs used by the home page gallery.
 *
 * Every image here comes from Wikimedia Commons and is published under a
 * licence that permits reuse (CC0 / public domain / CC BY / CC BY-SA).
 * The author, licence and original file page are stored alongside each photo
 * so the UI can render proper attribution — required by CC BY and CC BY-SA.
 *
 * Note: the Pokémon characters depicted are trademarks of Nintendo, Creatures
 * and GAME FREAK. These are documentary photographs of real-world objects and
 * events, not official artwork or game assets.
 */

export interface PokemonShot {
  /** Stable identifier, also used for the numbering badge */
  id: string
  /** Path under /public */
  src: string
  /** Short Chinese title shown on the card */
  title: string
  /** Alt text for accessibility */
  alt: string
  /** Photographer and licence, rendered as a caption line */
  credit: {
    author: string
    license: string
    licenseUrl: string
    /** Original file description page on Wikimedia Commons */
    source: string
  }
}

export const pokemonShots: PokemonShot[] = [
  {
    id: "pokemon-1",
    src: "/pokemon/pokemon-1.jpg",
    title: "皮卡丘拉花",
    alt: "一杯带有立体皮卡丘造型奶泡的拉花咖啡",
    credit: {
      author: "Ajay Suresh",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      source:
        "https://commons.wikimedia.org/wiki/File:3D_Pikachu_Latte_Art_-_Harajuku_(28080147878).jpg",
    },
  },
  {
    id: "pokemon-2",
    src: "/pokemon/pokemon-2.jpg",
    title: "屋顶上的皮卡丘",
    alt: "首尔市中心屋顶花园里的两只皮卡丘装置，背景是城市天际线",
    credit: {
      author: "Dr. Thomas Liptak",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      source:
        "https://commons.wikimedia.org/wiki/File:Seoul,_Jung_District,_HiKR_Ground_(Pikachu).jpg",
    },
  },
  {
    id: "pokemon-3",
    src: "/pokemon/pokemon-3.jpg",
    title: "皮卡丘玩偶服",
    alt: "动漫展上穿着皮卡丘造型玩偶服的扮演者",
    credit: {
      author: "Super Festivals",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      source:
        "https://commons.wikimedia.org/wiki/File:Cosplay_of_Pikachu_from_Pokemon_at_GalaxyCon_Richmond_2020_(49666784027).jpg",
    },
  },
  {
    id: "pokemon-4",
    src: "/pokemon/pokemon-4.jpg",
    title: "精灵球抱枕",
    alt: "商店货架上摆满皮卡丘脸造型与精灵球造型的毛绒抱枕",
    credit: {
      author: "Johannes Kalliauer",
      license: "Public domain",
      licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
      source: "https://commons.wikimedia.org/wiki/File:Pikachu_Pillows.jpg",
    },
  },
  {
    id: "pokemon-5",
    src: "/pokemon/pokemon-5.jpg",
    title: "街角的皮卡丘",
    alt: "苏格兰一家桌游店门口的巨大皮卡丘充气玩偶，路人驻足观看",
    credit: {
      author: "Walter Baxter",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      source:
        "https://commons.wikimedia.org/wiki/File:A_Pok%C3%A9mon_figure_outside_the_Geek_Retreat_in_Galashiels_-_geograph.org.uk_-_7138893.jpg",
    },
  },
  {
    id: "pokemon-6",
    src: "/pokemon/pokemon-6.jpg",
    title: "宝可梦中心·仙台",
    alt: "宝可梦中心门店内部的巨大 Pokémon 招牌与皮卡丘装饰",
    credit: {
      author: "広瀬川",
      license: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      source: "https://commons.wikimedia.org/wiki/File:Pokemon_Center_Tohoku.JPG",
    },
  },
  {
    id: "pokemon-7",
    src: "/pokemon/pokemon-7.jpg",
    title: "宝可梦中心·巴黎",
    alt: "巴黎宝可梦中心门店外观，门口排着长队",
    credit: {
      author: "Chikorita",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      source: "https://commons.wikimedia.org/wiki/File:Pokemon_Center_Paris.jpeg",
    },
  },
  {
    id: "pokemon-8",
    src: "/pokemon/pokemon-8.jpg",
    title: "皮卡丘米饭",
    alt: "餐厅里用黄色米饭捏成皮卡丘脸造型的餐点",
    credit: {
      author: "Marco Hazard",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
      source:
        "https://commons.wikimedia.org/wiki/File:Pikachu_style_yellow_rice_and_set_lunch_in_restaurant.jpg",
    },
  },
  {
    id: "pokemon-9",
    src: "/pokemon/pokemon-9.jpg",
    title: "布莱顿儿童游行",
    alt: "英国布莱顿儿童游行队伍抬着的巨大皮卡丘造型灯笼",
    credit: {
      author: "Andy Li",
      license: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      source:
        "https://commons.wikimedia.org/wiki/File:Theme_of_Pokemon_in_Brighton_Festival_2023_Children%E2%80%99s_Parade.jpg",
    },
  },
  {
    id: "pokemon-10",
    src: "/pokemon/pokemon-10.jpg",
    title: "斯图加特夜色",
    alt: "斯图加特市中心广场夜景中的巨大皮卡丘装置",
    credit: {
      author: "Almanta",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      source:
        "https://commons.wikimedia.org/wiki/File:Big_Pikachu_figure_at_K%C3%B6nigsbau_Stuttgart_(2022-12-31)_2.jpg",
    },
  },
]

/** Look up one shot by its id. */
export const getPokemonShot = (id: string): PokemonShot | undefined =>
  pokemonShots.find((shot) => shot.id === id)

/**
 * Cover artwork used for each photography collection on the /showcase page.
 * Keys are collection slugs; values are ids from `pokemonShots`. Collections
 * without an entry fall back to their original cover photo.
 */
export const showcasePokemonBySlug: Record<string, string> = {
  "new-zealand": "pokemon-5",
  tokyo: "pokemon-2",
  bali: "pokemon-9",
  iceland: "pokemon-6",
  morocco: "pokemon-7",
  "urban-portraits": "pokemon-3",
  santorini: "pokemon-8",
}

/** Wide night shot used as the /showcase hero backdrop. */
export const showcaseHeroShotId = "pokemon-10"

/**
 * Five additional photographs shown on /showcase as flip cards. Each one is
 * distinct from the set used by the home-page marquee, and every entry carries
 * the author + licence needed for attribution.
 */
export const flipShots: PokemonShot[] = [
  {
    id: "pokemon-11",
    src: "/pokemon/pokemon-11.jpg",
    title: "皮卡丘大游行",
    alt: "游行队伍中成群结队的皮卡丘人偶，最前面那只戴着花环",
    credit: {
      author: "Yoshikazu TAKADA",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      source: "https://commons.wikimedia.org/wiki/File:Pikachu_Parade_(14905092432).jpg",
    },
  },
  {
    id: "pokemon-12",
    src: "/pokemon/pokemon-12.jpg",
    title: "皮卡丘限定掌机",
    alt: "亮黄色的皮卡丘限定版 Game Boy Color 掌机正面特写",
    credit: {
      author: "JudeHalley",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      source: "https://commons.wikimedia.org/wiki/File:Pokemon_Pikachu_(front).jpg",
    },
  },
  {
    id: "pokemon-13",
    src: "/pokemon/pokemon-13.jpg",
    title: "皮卡丘便当",
    alt: "用蛋皮、小番茄和海苔做成皮卡丘脸的日式便当盒",
    credit: {
      author: "Shuichi Kodama",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      source: "https://commons.wikimedia.org/wiki/File:Eatable_Pikachu_(4643470424).jpg",
    },
  },
  {
    id: "pokemon-14",
    src: "/pokemon/pokemon-14.jpg",
    title: "宝可梦中心·广岛",
    alt: "广岛宝可梦中心门店入口，上方悬挂巨大的 Pokémon 招牌",
    credit: {
      author: "Yoh-Plus",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      source: "https://commons.wikimedia.org/wiki/File:PokemonCenter_Hiroshima.jpg",
    },
  },
  {
    id: "pokemon-15",
    src: "/pokemon/pokemon-15.jpg",
    title: "宝可梦商店·东京站",
    alt: "东京站宝可梦商店的陈列柜，摆满皮卡丘玩偶与礼盒",
    credit: {
      author: "電車（新幹線）でゴー！",
      license: "CC0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      source:
        "https://commons.wikimedia.org/wiki/File:Pokemon_store_in_Tokyo_Station_01.jpg",
    },
  },
]
