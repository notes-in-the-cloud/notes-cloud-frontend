import HeaderBar from "./HeaderBar"
import type { Page } from "./types"

export default function Notes({onNavigate}:{onNavigate:(page:Page)=>void}){
    return(
        <div className="notes-layout">
            <HeaderBar onLogOut={()=>onNavigate('login')}/>
            <main className="main-container">smth</main>
        </div>
    )
}