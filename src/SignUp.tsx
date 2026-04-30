import { useForm } from 'react-hook-form';
import type { SignUpData } from './types';

export default function SignUp() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpData>();

    const onSubmit = (data: SignUpData) => {
        if (localStorage.getItem(data.email)) {
            console.log("User with this email already exists");
            return;
        }
        localStorage.setItem(data.email, JSON.stringify({ name: data.name, password: data.password }));
        console.log("Registered successfully: " + data.name);
    };

    return (
        <>
            <h2>Sign up form</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input
                    type="text"
                    {...register("name", { required: true })}
                    placeholder="Your name"
                />
                {errors.name && <span style={{ color: "red" }}>*Name* is mandatory</span>}

                <input
                    type="email"
                    {...register("email", { required: true })}
                    placeholder="email@example.com"
                />
                {errors.email && <span style={{ color: "red" }}>*Email* is mandatory</span>}

                <input
                    type="password"
                    {...register("password", { required: true })}
                    placeholder="Password"
                />
                {errors.password && <span style={{ color: "red" }}>*Password* is mandatory</span>}

                <input type="submit" value="Sign up" />
            </form>
        </>
    );
}
