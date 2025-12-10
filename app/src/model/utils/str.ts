export function initCap(str: string) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function initCapSentence(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toMoney(money: number) {
    return Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(+money.toFixed(2))
}

export function isPassSecure(pass: string) {

    if (pass.length < 8)
        return false;

    if (!/[A-Z]/g.test(pass))
        return false;

    if (!/[a-z]/g.test(pass))
        return false;

    if (!/[0-9]/g.test(pass))
        return false;

    if (!/[^a-zA-Z0-9]/g.test(pass))
        return false;


    return true;
}