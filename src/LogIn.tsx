import { useForm } from 'react-hook-form';
import type { LoginData } from './types';

export default function LogIn(){
    const {
        register,
        handleSubmit,
        formState:{errors},
    }=useForm<LoginData>();

    //fetch user data from database EDIT later for now i use the localStorage for test
    const onSubmit=(data: LoginData)=>{
        const raw = localStorage.getItem(data.email);
        const userData = raw ? JSON.parse(raw) : null;
        if(userData){
            if(userData.password==data.password){
                console.log(userData.name+" You are succesfully logged in");
            }else{
                console.log("The password or email doesnt match");
            }
        };
    }

    return(
        <>
            <h2>Log in form</h2>

            <form className="App" onSubmit={handleSubmit(onSubmit)}>
                <input type="email" {...register("email",{required:true})}
                placeholder="email@example.com"
                />
            <input type="password" {...register("password",{required:true})}
                placeholder="Password"
            />

            {errors.password && <span style={{color:"red"}}>*Password* is mandatory</span> }
            <input type="submit" style={{}}></input>
            </form>
        </>
    )
}
