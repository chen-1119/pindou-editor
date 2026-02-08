// 拼豆品牌色卡数据 - 扩展版 (100+ 颜色)
export const BEAD_BRANDS = {
    MARD: 'Mard',
    PERLER: 'Perler',
    ARTKAL: 'Artkal',
    HAMA: 'Hama'
};

export const BEAD_COLORS = [
    // ===== 白色系 =====
    { id: 'white', name: '纯白', hex: '#FFFFFF', brand: 'MARD', code: 'M01' },
    { id: 'snow', name: '雪白', hex: '#FFFAFA', brand: 'MARD', code: 'M02' },
    { id: 'ivory', name: '象牙白', hex: '#FFFFF0', brand: 'MARD', code: 'M03' },
    { id: 'cream', name: '奶白', hex: '#FFF8E7', brand: 'MARD', code: 'M04' },
    { id: 'linen', name: '亚麻白', hex: '#FAF0E6', brand: 'MARD', code: 'M05' },

    // ===== 灰色系 =====
    { id: 'lightgray', name: '浅灰', hex: '#D3D3D3', brand: 'MARD', code: 'M06' },
    { id: 'silver', name: '银灰', hex: '#C0C0C0', brand: 'MARD', code: 'M07' },
    { id: 'gray', name: '灰色', hex: '#9CA3AF', brand: 'MARD', code: 'M08' },
    { id: 'darkgray', name: '深灰', hex: '#6B7280', brand: 'MARD', code: 'M09' },
    { id: 'charcoal', name: '炭灰', hex: '#4B5563', brand: 'MARD', code: 'M10' },
    { id: 'slate', name: '石板灰', hex: '#374151', brand: 'MARD', code: 'M11' },

    // ===== 黑色系 =====
    { id: 'black', name: '纯黑', hex: '#000000', brand: 'MARD', code: 'M12' },
    { id: 'jetblack', name: '墨黑', hex: '#1F2937', brand: 'MARD', code: 'M13' },
    { id: 'obsidian', name: '曜石黑', hex: '#111827', brand: 'MARD', code: 'M14' },

    // ===== 红色系 =====
    { id: 'lightpink', name: '浅粉', hex: '#FFB6C1', brand: 'MARD', code: 'M15' },
    { id: 'pink', name: '粉红', hex: '#FFC0CB', brand: 'MARD', code: 'M16' },
    { id: 'hotpink', name: '玫红', hex: '#FF69B4', brand: 'MARD', code: 'M17' },
    { id: 'deeppink', name: '深粉', hex: '#FF1493', brand: 'MARD', code: 'M18' },
    { id: 'rosepink', name: '玫瑰粉', hex: '#FF007F', brand: 'MARD', code: 'M19' },
    { id: 'coral', name: '珊瑚红', hex: '#FF6B6B', brand: 'MARD', code: 'M20' },
    { id: 'salmon', name: '鲑鱼红', hex: '#FA8072', brand: 'MARD', code: 'M21' },
    { id: 'tomato', name: '番茄红', hex: '#FF6347', brand: 'MARD', code: 'M22' },
    { id: 'red', name: '正红', hex: '#FF0000', brand: 'MARD', code: 'M23' },
    { id: 'crimson', name: '绯红', hex: '#DC143C', brand: 'MARD', code: 'M24' },
    { id: 'darkred', name: '暗红', hex: '#8B0000', brand: 'MARD', code: 'M25' },
    { id: 'maroon', name: '栗红', hex: '#800000', brand: 'MARD', code: 'M26' },
    { id: 'burgundy', name: '酒红', hex: '#722F37', brand: 'MARD', code: 'M27' },

    // ===== 橙色系 =====
    { id: 'peach', name: '蜜桃', hex: '#FFDAB9', brand: 'MARD', code: 'M28' },
    { id: 'apricot', name: '杏色', hex: '#FBCEB1', brand: 'MARD', code: 'M29' },
    { id: 'lightorange', name: '浅橙', hex: '#FFB347', brand: 'MARD', code: 'M30' },
    { id: 'orange', name: '橙色', hex: '#FFA500', brand: 'MARD', code: 'M31' },
    { id: 'darkorange', name: '深橙', hex: '#FF8C00', brand: 'MARD', code: 'M32' },
    { id: 'tangerine', name: '橘红', hex: '#FF8C42', brand: 'MARD', code: 'M33' },
    { id: 'rust', name: '铁锈橙', hex: '#B7410E', brand: 'MARD', code: 'M34' },

    // ===== 黄色系 =====
    { id: 'lightyellow', name: '浅黄', hex: '#FFFFE0', brand: 'MARD', code: 'M35' },
    { id: 'lemon', name: '柠檬黄', hex: '#FFF44F', brand: 'MARD', code: 'M36' },
    { id: 'yellow', name: '明黄', hex: '#FFFF00', brand: 'MARD', code: 'M37' },
    { id: 'gold', name: '金黄', hex: '#FFD700', brand: 'MARD', code: 'M38' },
    { id: 'amber', name: '琥珀', hex: '#FFBF00', brand: 'MARD', code: 'M39' },
    { id: 'mustard', name: '芥末黄', hex: '#FFDB58', brand: 'MARD', code: 'M40' },
    { id: 'khaki', name: '卡其', hex: '#C3B091', brand: 'MARD', code: 'M41' },
    { id: 'olive', name: '橄榄', hex: '#808000', brand: 'MARD', code: 'M42' },

    // ===== 绿色系 =====
    { id: 'palegreen', name: '淡绿', hex: '#98FB98', brand: 'MARD', code: 'M43' },
    { id: 'lightgreen', name: '浅绿', hex: '#90EE90', brand: 'MARD', code: 'M44' },
    { id: 'lime', name: '青柠', hex: '#32CD32', brand: 'MARD', code: 'M45' },
    { id: 'green', name: '绿色', hex: '#00FF00', brand: 'MARD', code: 'M46' },
    { id: 'grassgreen', name: '草绿', hex: '#7CFC00', brand: 'MARD', code: 'M47' },
    { id: 'leafgreen', name: '叶绿', hex: '#22C55E', brand: 'MARD', code: 'M48' },
    { id: 'emerald', name: '翠绿', hex: '#50C878', brand: 'MARD', code: 'M49' },
    { id: 'seagreen', name: '海绿', hex: '#2E8B57', brand: 'MARD', code: 'M50' },
    { id: 'forestgreen', name: '森林绿', hex: '#228B22', brand: 'MARD', code: 'M51' },
    { id: 'darkgreen', name: '深绿', hex: '#006400', brand: 'MARD', code: 'M52' },
    { id: 'huntergreen', name: '猎人绿', hex: '#355E3B', brand: 'MARD', code: 'M53' },

    // ===== 青色系 =====
    { id: 'mint', name: '薄荷', hex: '#98FF98', brand: 'MARD', code: 'M54' },
    { id: 'aqua', name: '水色', hex: '#00FFFF', brand: 'MARD', code: 'M55' },
    { id: 'cyan', name: '青色', hex: '#00CED1', brand: 'MARD', code: 'M56' },
    { id: 'turquoise', name: '青绿', hex: '#40E0D0', brand: 'MARD', code: 'M57' },
    { id: 'teal', name: '蓝绿', hex: '#008080', brand: 'MARD', code: 'M58' },
    { id: 'darkteal', name: '深蓝绿', hex: '#014D4E', brand: 'MARD', code: 'M59' },

    // ===== 蓝色系 =====
    { id: 'lightblue', name: '浅蓝', hex: '#ADD8E6', brand: 'MARD', code: 'M60' },
    { id: 'skyblue', name: '天蓝', hex: '#87CEEB', brand: 'MARD', code: 'M61' },
    { id: 'babyblue', name: '婴儿蓝', hex: '#89CFF0', brand: 'MARD', code: 'M62' },
    { id: 'cornflower', name: '矢车菊蓝', hex: '#6495ED', brand: 'MARD', code: 'M63' },
    { id: 'blue', name: '蓝色', hex: '#0000FF', brand: 'MARD', code: 'M64' },
    { id: 'royalblue', name: '皇家蓝', hex: '#4169E1', brand: 'MARD', code: 'M65' },
    { id: 'dodgerblue', name: '道奇蓝', hex: '#1E90FF', brand: 'MARD', code: 'M66' },
    { id: 'azure', name: '蔚蓝', hex: '#007FFF', brand: 'MARD', code: 'M67' },
    { id: 'cobalt', name: '钴蓝', hex: '#0047AB', brand: 'MARD', code: 'M68' },
    { id: 'navy', name: '海军蓝', hex: '#000080', brand: 'MARD', code: 'M69' },
    { id: 'darkblue', name: '深蓝', hex: '#00008B', brand: 'MARD', code: 'M70' },
    { id: 'midnight', name: '午夜蓝', hex: '#191970', brand: 'MARD', code: 'M71' },

    // ===== 紫色系 =====
    { id: 'lavender', name: '薰衣草', hex: '#E6E6FA', brand: 'MARD', code: 'M72' },
    { id: 'lilac', name: '丁香紫', hex: '#C8A2C8', brand: 'MARD', code: 'M73' },
    { id: 'orchid', name: '兰花紫', hex: '#DA70D6', brand: 'MARD', code: 'M74' },
    { id: 'violet', name: '紫罗兰', hex: '#EE82EE', brand: 'MARD', code: 'M75' },
    { id: 'magenta', name: '洋红', hex: '#FF00FF', brand: 'MARD', code: 'M76' },
    { id: 'fuchsia', name: '品红', hex: '#FF00FF', brand: 'MARD', code: 'M77' },
    { id: 'purple', name: '紫色', hex: '#800080', brand: 'MARD', code: 'M78' },
    { id: 'amethyst', name: '紫水晶', hex: '#9966CC', brand: 'MARD', code: 'M79' },
    { id: 'grape', name: '葡萄紫', hex: '#6F2DA8', brand: 'MARD', code: 'M80' },
    { id: 'plum', name: '梅紫', hex: '#8E4585', brand: 'MARD', code: 'M81' },
    { id: 'indigo', name: '靛蓝', hex: '#4B0082', brand: 'MARD', code: 'M82' },
    { id: 'darkpurple', name: '深紫', hex: '#301934', brand: 'MARD', code: 'M83' },

    // ===== 棕色系 =====
    { id: 'beige', name: '米色', hex: '#F5F5DC', brand: 'MARD', code: 'M84' },
    { id: 'tan', name: '棕褐', hex: '#D2B48C', brand: 'MARD', code: 'M85' },
    { id: 'camel', name: '驼色', hex: '#C19A6B', brand: 'MARD', code: 'M86' },
    { id: 'sand', name: '沙色', hex: '#C2B280', brand: 'MARD', code: 'M87' },
    { id: 'lightbrown', name: '浅棕', hex: '#C4A484', brand: 'MARD', code: 'M88' },
    { id: 'brown', name: '棕色', hex: '#A52A2A', brand: 'MARD', code: 'M89' },
    { id: 'chocolate', name: '巧克力', hex: '#7B3F00', brand: 'MARD', code: 'M90' },
    { id: 'coffee', name: '咖啡', hex: '#6F4E37', brand: 'MARD', code: 'M91' },
    { id: 'sienna', name: '赭色', hex: '#A0522D', brand: 'MARD', code: 'M92' },
    { id: 'darkbrown', name: '深棕', hex: '#5C4033', brand: 'MARD', code: 'M93' },
    { id: 'espresso', name: '浓咖啡', hex: '#3C2415', brand: 'MARD', code: 'M94' },

    // ===== 肤色系 =====
    { id: 'fairskin', name: '白皙肤', hex: '#FFE4C4', brand: 'MARD', code: 'M95' },
    { id: 'lightskin', name: '浅肤色', hex: '#FFDAB9', brand: 'MARD', code: 'M96' },
    { id: 'skin', name: '肤色', hex: '#E8BEAC', brand: 'MARD', code: 'M97' },
    { id: 'tanskin', name: '小麦肤', hex: '#D2A679', brand: 'MARD', code: 'M98' },
    { id: 'darkskin', name: '深肤色', hex: '#8D5524', brand: 'MARD', code: 'M99' },

    // ===== 荧光色系 =====
    { id: 'neonpink', name: '荧光粉', hex: '#FF6EC7', brand: 'MARD', code: 'N01' },
    { id: 'neonred', name: '荧光红', hex: '#FF3131', brand: 'MARD', code: 'N02' },
    { id: 'neonorange', name: '荧光橙', hex: '#FF5F1F', brand: 'MARD', code: 'N03' },
    { id: 'neonyellow', name: '荧光黄', hex: '#DFFF00', brand: 'MARD', code: 'N04' },
    { id: 'neongreen', name: '荧光绿', hex: '#39FF14', brand: 'MARD', code: 'N05' },
    { id: 'neonblue', name: '荧光蓝', hex: '#1F51FF', brand: 'MARD', code: 'N06' },
    { id: 'neonpurple', name: '荧光紫', hex: '#BC13FE', brand: 'MARD', code: 'N07' },
];

// 按颜色分类
export const COLOR_CATEGORIES = {
    '白灰黑': ['white', 'snow', 'cream', 'lightgray', 'gray', 'darkgray', 'charcoal', 'black'],
    '粉红': ['lightpink', 'pink', 'hotpink', 'deeppink', 'rosepink', 'coral', 'salmon'],
    '红色': ['tomato', 'red', 'crimson', 'darkred', 'maroon', 'burgundy'],
    '橙色': ['peach', 'apricot', 'lightorange', 'orange', 'darkorange', 'tangerine', 'rust'],
    '黄色': ['lightyellow', 'lemon', 'yellow', 'gold', 'amber', 'mustard', 'khaki', 'olive'],
    '绿色': ['palegreen', 'lightgreen', 'lime', 'green', 'grassgreen', 'leafgreen', 'emerald', 'seagreen', 'forestgreen', 'darkgreen'],
    '青色': ['mint', 'aqua', 'cyan', 'turquoise', 'teal', 'darkteal'],
    '蓝色': ['lightblue', 'skyblue', 'babyblue', 'cornflower', 'blue', 'royalblue', 'dodgerblue', 'azure', 'cobalt', 'navy', 'darkblue'],
    '紫色': ['lavender', 'lilac', 'orchid', 'violet', 'magenta', 'purple', 'amethyst', 'grape', 'plum', 'indigo'],
    '棕色': ['beige', 'tan', 'camel', 'sand', 'lightbrown', 'brown', 'chocolate', 'coffee', 'sienna', 'darkbrown'],
    '肤色': ['fairskin', 'lightskin', 'skin', 'tanskin', 'darkskin'],
    '荧光': ['neonpink', 'neonred', 'neonorange', 'neonyellow', 'neongreen', 'neonblue', 'neonpurple'],
};

export const getColorById = (id) => BEAD_COLORS.find(c => c.id === id);
export const getColorsByCategory = (category) =>
    COLOR_CATEGORIES[category]?.map(id => getColorById(id)).filter(Boolean) || [];
