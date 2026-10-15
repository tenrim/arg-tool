// Shared descriptive metadata; models and discovery consume the same definitions.
export const TYPES={
 sudoku:{name:'标准数独',code:0,rows:9,cols:9,min:1,max:9,rule:'每行、每列和每个宫内数字不重复。9×9 填 1–9（3×3 宫），4×4 填 1–4（2×2 宫），6×6 填 1–6（2×3 宫）。',entry:'点击格子，再点数字；空格用“擦除”。粘贴时 0 或 . 表示空格。'},
 slitherlink:{name:'数回',code:1,rows:5,cols:5,min:0,max:3,rule:'沿格子边缘连成一条不分叉、不交叉的闭合回路。数字表示该格四周恰好经过几条线。',entry:'录入 0–3 的数字条件，未给数字的格子留空。求解后蓝色为确定的线，× 为确定不连线。'},
 nurikabe:{name:'数墙',code:2,rows:5,cols:5,min:1,max:225,rule:'每个白色岛屿恰有一个数字，面积等于数字；黑色海域连通，不能出现 2×2 的全黑方块。岛屿不能通过边相连。',entry:'录入岛屿面积数字。求解后深色为海，浅色为岛；? 表示暂时不能确定。'},
 akari:{name:'照明',code:3,rows:5,cols:5,min:0,max:4,rule:'在白格放灯，光沿行列传播并被黑格阻挡。所有白格必须被照亮，灯不能互相照射；黑格数字等于四邻的灯数。',entry:'数字 0–4 会生成带数字的黑格；“黑格”生成无数字黑格。白格留空。结果中 ● 为灯、· 为确定不放灯。'}
};
