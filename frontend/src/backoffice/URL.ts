export default function(path: string) {
    return process.env.REACT_APP_BACKOFFICE_PREFIX_URL! + path;
}
