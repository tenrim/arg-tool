// ARG adapter: typed grid data in, upstream irrefutable facts out. No puzzle URLs or upstream UI.
fn arg_grid<T: std::fmt::Display>(grid: &[Vec<Option<T>>]) -> String {
    format!("[{}]", grid.iter().map(|row| format!("[{}]", row.iter().map(|v| match v {Some(n)=>n.to_string(),None=>"null".to_string()}).collect::<Vec<_>>().join(","))).collect::<Vec<_>>().join(","))
}
#[no_mangle]
pub extern "C" fn arg_solve_board(input: *const i32, count: usize) -> *const u8 {
    use cspuz_rs_puzzles::puzzles::{sudoku,slitherlink,nurikabe,akari};
    let data = unsafe { std::slice::from_raw_parts(input, count) };
    let answer = (|| -> Option<String> {
        if data.len()<3 { return None; }
        let (kind,h,w)=(data[0],data[1] as usize,data[2] as usize);
        if h<2 || w<2 || h>15 || w>15 || data.len()!=3+h*w { return None; }
        if kind==0 && (h!=w || ![4,6,9].contains(&h)) {return None;}
        let mut clues=vec![vec![None;w];h];
        for y in 0..h {for x in 0..w {let v=data[3+y*w+x];let valid=match kind {0=>v==-2 || (v>=1 && v<=h as i32),1=>v==-2 || (0..=3).contains(&v),2=>v==-2 || (v>=1 && v<=(h*w) as i32),3=>(-2..=4).contains(&v),_=>false};if !valid{return None;}clues[y][x]=if v == -2 {None}else{Some(v)};}}
        match kind {
            0=>Some(match sudoku::solve_sudoku(&clues){None=>"{\"status\":\"unsatisfiable\"}".into(),Some(g)=>format!("{{\"status\":\"{}\",\"cells\":{}}}",if g.iter().flatten().all(Option::is_some){"complete"}else{"partial"},arg_grid(&g))}),
            1=>Some(match slitherlink::solve_slitherlink(false,&clues){None=>"{\"status\":\"unsatisfiable\"}".into(),Some(g)=>format!("{{\"status\":\"{}\",\"horizontal\":{},\"vertical\":{}}}",if g.horizontal.iter().flatten().chain(g.vertical.iter().flatten()).all(Option::is_some){"complete"}else{"partial"},arg_grid(&g.horizontal),arg_grid(&g.vertical))}),
            2|3=>{let result=if kind==2 {nurikabe::solve_nurikabe(&clues)}else{akari::solve_akari(&clues)};Some(match result{None=>"{\"status\":\"unsatisfiable\"}".into(),Some(g)=>format!("{{\"status\":\"{}\",\"cells\":{}}}",if g.iter().flatten().all(Option::is_some){"complete"}else{"partial"},arg_grid(&g))})},
            _=>None,
        }
    })().unwrap_or_else(||"{\"status\":\"invalid\"}".into());
    unsafe {SHARED_ARRAY.clear();SHARED_ARRAY.extend_from_slice(&(answer.len() as u32).to_le_bytes());SHARED_ARRAY.extend_from_slice(answer.as_bytes());SHARED_ARRAY.as_ptr()}
}
