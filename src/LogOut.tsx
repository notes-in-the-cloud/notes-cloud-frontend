export default function LogOut({onConfirm}:{onConfirm:()=>void}){
    return(
        <button className="log-out-bnt" onClick={onConfirm}>LogOut</button>
    )
};