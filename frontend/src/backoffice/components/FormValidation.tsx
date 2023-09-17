import { IFormValidationProps } from "../../../types/backoffice.types";

export default function(props: IFormValidationProps) {
    return props.error ? (
        <p className="text-danger">{props.error}</p>
    ) : (<></>);
};
