export interface Strings {
    title: string,
    send: string,
    unknownFile: string,
    unknownCard: string,
    receiptTax: string,
    receiptTotal: string
    messageRetry: string,
    messageFailed: string,
    messageSending: string,
    timeSent: string,
    consolePlaceholder: string,
    listeningIndicator: string
}

interface LocalizedStrings {
    [locale: string]: Strings
}

const localizedStrings: LocalizedStrings = {
    'en-us': {
        title: "Chat",
        send: "Send",
        unknownFile: "[File of type '%1']",
        unknownCard: "[Unknown Card '%1']",
        receiptTax: "Tax",
        receiptTotal: "Total",
        messageRetry: "retry",
        messageFailed: "couldn't send",
        messageSending: "sending",
        timeSent: " at %1",
        consolePlaceholder: "Type your message...",
        listeningIndicator: "Listening..."
    },
    'de-de': {
        title: "Chat",
        send: "Senden",
        unknownFile: "[Datei vom Typ '%1']",
        unknownCard: "[Unbekannte Card '%1']",
        receiptTax: "MwSt.",
        receiptTotal: "Gesamtbetrag",
        messageRetry: "wiederholen",
        messageFailed: "konnte nicht senden",
        messageSending: "sendet",
        timeSent: " am %1",
        consolePlaceholder: "Verfasse eine Nachricht...",
        listeningIndicator: "Hören..."
    },
    'pl-pl': {
        title: "Chat",
        send: "Wyślij",
        unknownFile: "[Plik typu '%1']",
        unknownCard: "[Nieznana karta '%1']",
        receiptTax: "Podatek",
        receiptTotal: "Razem",
        messageRetry: "wyślij ponownie",
        messageFailed: "wysłanie nieudane",
        messageSending: "wysyłanie",
        timeSent: " o %1",
        consolePlaceholder: "Wpisz swoją wiadomość...",
        listeningIndicator: "Słuchający..."
    },
    'ru-ru': {
        title: "Чат",
        send: "Отправить",
        unknownFile: "[Неизвестный тип '%1']",
        unknownCard: "[Неизвестная карта '%1']",
        receiptTax: "Налог",
        receiptTotal: "Итого",
        messageRetry: "повторить",
        messageFailed: "не удалось отправить",
        messageSending: "отправка",
        timeSent: " в %1",
        consolePlaceholder: "Введите ваше сообщение...",
        listeningIndicator: "прослушивание..."
    },
    'nl-nl': {
        title: "Chat",
        send: "Verstuur",
        unknownFile: "[Bestand van het type '%1']",
        unknownCard: "[Onbekende kaart '%1']",
        receiptTax: "BTW",
        receiptTotal: "Totaal",
        messageRetry: "opnieuw",
        messageFailed: "versturen mislukt",
        messageSending: "versturen",
        timeSent: " om %1",
        consolePlaceholder: "Typ je bericht...",
        listeningIndicator: "het luisteren..."
    },
    'lv-lv': {
        title: "Tērzēšana",
        send: "Sūtīt",
        unknownFile: "[Nezināms tips '%1']",
        unknownCard: "[Nezināma kartīte '%1']",
        receiptTax: "Nodoklis",
        receiptTotal: "Kopsumma",
        messageRetry: "Mēģināt vēlreiz",
        messageFailed: "Neizdevās nosūtīt",
        messageSending: "Nosūtīšana",
        timeSent: " %1",
        consolePlaceholder: "Ierakstiet savu ziņu...",
        listeningIndicator: "Klausoties..."
    },
    'pt-br': {
        title: "Bate-papo",
        send: "Enviar",
        unknownFile: "[Arquivo do tipo '%1']",
        unknownCard: "[Cartão desconhecido '%1']",
        receiptTax: "Imposto",
        receiptTotal: "Total",
        messageRetry: "repedit",
        messageFailed: "não pude enviar",
        messageSending: "enviando",
        timeSent: " às %1",
        consolePlaceholder: "Digite sua mensagem...",
        listeningIndicator: "Ouvindo..."
    },
    'fr-fr': {
        title: "Chat",
        send: "Envoyer",
        unknownFile: "[Fichier de type '%1']",
        unknownCard: "[Carte inconnue '%1']",
        receiptTax: "Taxe",
        receiptTotal: "Total",
        messageRetry: "reéssayer",
        messageFailed: "envoi impossible",
        messageSending: "envoi",
        timeSent: " à %1",
        consolePlaceholder: "Écrivez votre message...",
        listeningIndicator: "Écoute..."
    },
    'es-es': {
        title: "Chat",
        send: "Enviar",
        unknownFile: "[Archivo de tipo '%1']",
        unknownCard: "[Tarjeta desconocida '%1']",
        receiptTax: "Impuestos",
        receiptTotal: "Total",
        messageRetry: "reintentar",
        messageFailed: "no enviado",
        messageSending: "enviando",
        timeSent: " a las %1",
        consolePlaceholder: "Escribe tu mensaje...",
        listeningIndicator: "Escuchando..."
    },
    'el-gr': {
        title: "Συνομιλία",
        send: "Αποστολή",
        unknownFile: "[Αρχείο τύπου '%1']",
        unknownCard: "[Αγνωστη Κάρτα '%1']",
        receiptTax: "ΦΠΑ",
        receiptTotal: "Σύνολο",
        messageRetry: "δοκιμή",
        messageFailed: "αποτυχία",
        messageSending: "αποστολή",
        timeSent: " την %1",
        consolePlaceholder: "Πληκτρολόγηση μηνύματος...",
        listeningIndicator: "Ακούγοντας..."
    },
    'it-it': {
        title: "Chat",
        send: "Invia",
        unknownFile: "[File di tipo '%1']",
        unknownCard: "[Card sconosciuta '%1']",
        receiptTax: "Tasse",
        receiptTotal: "Totale",
        messageRetry: "riprova",
        messageFailed: "impossibile inviare",
        messageSending: "invio",
        timeSent: " il %1",
        consolePlaceholder: "Scrivi il tuo messaggio...",
        listeningIndicator: "Ascoltando..."
    }
}

export const defaultStrings = localizedStrings['en-us'];

// Returns strings using the "best match available"" locale
// e.g. if 'en-us' is the only supported English locale, then
// strings('en') should return localizedStrings('en-us')

export const strings = (locale: string) => {
    if (locale.startsWith('de'))
        locale = 'de-de';
    else if (locale.startsWith('pl'))
        locale = 'pl-pl';
    else if (locale.startsWith('ru'))
        locale = 'ru-ru';
    else if (locale.startsWith('nl'))
        locale = 'nl-nl';
    else if (locale.startsWith('lv'))
        locale = 'lv-lv';
    else if (locale.startsWith('pt'))
        locale = 'pt-br';
    else if (locale.startsWith('fr'))
        locale = 'fr-fr';
    else if (locale.startsWith('es'))
        locale = 'es-es';
    else if (locale.startsWith('el'))
        locale = 'el-gr';
    else if (locale.startsWith('it'))
        locale = 'it-it';
    else
        locale = 'en-us';

    return localizedStrings[locale];
}
