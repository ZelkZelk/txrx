import LogoDark from './../../../assets/images/logo/logo-dark.svg';
import Logo from './../../../assets/images/logo/logo.svg';

export default function() {
    return (
        <div className="flex h-screen items-center justify-center bg-gray dark:border-strokedark dark:bg-boxdark ">
            <div className="flex flex-wrap items-center max-w-[410px]">
                <div className="hidden w-full xl:block">
                    <div className="max-w-xl text-center">
                        <img className="hidden dark:block" src={LogoDark} alt="Logo" />
                        <img className="dark:hidden" src={Logo} alt="Logo" />
                    </div>
                </div>
            </div>
        </div>
    );
}
