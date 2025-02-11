// Sélection des éléments du DOM

let Conteneur = document.querySelector(".container");
let uploadBox = document.querySelector(".upload-box"); // Conteneur du champ d'upload
let avatarUpload = document.getElementById("avatar-upload"); // Champ input type file
let avatarUploadLabel = document.querySelector(".avatar-upload"); // Label du champ d'upload
let toutMessage = document.getElementById("tout-message"); // Message global (optionnel)
let message = document.getElementById("message"); // Message d'erreur ou de succès
let image = document.getElementById("image"); // Image affichée après upload
let formulaire = document.getElementById("ticket-form"); // Formulaire global
let nomComplet = document.getElementById("full-name"); // Champ du nom complet
let email = document.getElementById("email"); // Champ email
let nomGithub = document.getElementById("github-username"); // Champ nom GitHub
const confirmation = document.getElementById("confirmation");
const confirmationName = document.getElementById("confirmation-name");
const confirmationEmail = document.getElementById("confirmation-email");
const confirmationImage = document.getElementById("image-charger");
const confirmationTimer = document.getElementById("confirmation-timer");
const confirmationGithub = document.getElementById("confirmation-github");
const confirmationNameTicket = document.getElementById("confirmation-name-ticket");
const downloadPdf = document.getElementById('download-pdf');
const ticket = document.getElementById('ticket');


// Ajout d'un message d'erreur sous chaque champ
let emailErreur = document.createElement("span");
emailErreur.className = "erreur-message";
email.parentNode.appendChild(emailErreur);

let githubErreur = document.createElement("span");
githubErreur.className = "erreur-message";
nomGithub.parentNode.appendChild(githubErreur);

let nomErreur = document.createElement("span");
nomErreur.className = "erreur-message";
nomComplet.parentNode.appendChild(nomErreur);

// Ajout d'un aperçu par défaut si aucune image n'est sélectionnée
const defaultImageSrc = "images.png"; // Remplacez par une image par défaut
image.src = defaultImageSrc;

// Ajout d'`aria-live` pour l'accessibilité
message.setAttribute("aria-live", "polite");

// Constantes pour la validation
const MAX_FILE_SIZE = 500 * 1024; // Taille maximale du fichier : 500 Ko
const MAX_IMAGE_RESOLUTION = 1024; // Résolution maximale de l'image : 1024x1024 pixels

// Événement déclenché lorsque l'utilisateur sélectionne un fichier
avatarUpload.addEventListener("change", (event) => {
    let file = event.target.files[0]; // Récupère le fichier sélectionné par l'utilisateur

    affichageImage(file, image, message); // Appelle la fonction pour traiter et afficher l'image

    // Ajoute une classe pour styliser la boîte quand un fichier est sélectionné
    if (file) {
        uploadBox.classList.add("file-selection");
    } else {
        uploadBox.classList.remove("file-selection");
        image.src = defaultImageSrc; // Remet l'image par défaut
        image.style.borderRadius = "50%";
    }
});

/**
 * Fonction qui gère l'affichage de l'image sélectionnée et la validation du fichier
 * @param {File} file - Le fichier sélectionné par l'utilisateur
 * @param {HTMLImageElement} image - L'élément <img> qui affichera l'aperçu
 * @param {HTMLElement} message - L'élément qui affichera les messages d'erreur ou succès
 */
function affichageImage(file, image, message) {
    if (file) { // Vérifie si un fichier a bien été sélectionné
        // Vérifie si le fichier est une image au format PNG ou JPEG
        if (file.type === "image/png" || file.type === "image/jpeg") {
            if (file.size <= MAX_FILE_SIZE) { // Vérifie si la taille est inférieure ou égale à 500 Ko
                let lire = new FileReader(); // Crée un objet FileReader pour lire le fichier

                // Événement déclenché lorsque la lecture du fichier est terminée
                lire.onload = function () {
                    // Vérifie la résolution de l'image
                    const img = new Image();
                    img.src = this.result;
                    img.onload = () => {
                        if (img.width > MAX_IMAGE_RESOLUTION || img.height > MAX_IMAGE_RESOLUTION) {
                            message.textContent = "La résolution de l'image est trop grande (max 1024x1024).";
                            message.style.color = "red";
                            image.src = defaultImageSrc; // Remet l'image par défaut
                            image.style.borderRadius = "50%";
                        } else {
                            image.src = this.result; // Met à jour la source de l'image avec le contenu du fichier
                            image.style.display = "block"; // Affiche l'image
                            message.textContent = "Fichier accepté"; // Message de confirmation
                            message.style.color = "green"; // Couleur verte pour indiquer la validation
                        }
                    };
                };

                // Gestion des erreurs de lecture de fichier
                lire.onerror = function () {
                    message.textContent = "Erreur lors de la lecture du fichier.";
                    message.style.color = "red";
                };

                lire.readAsDataURL(file); // Lit le fichier et génère une URL base64
            } else {
                // Si le fichier est trop volumineux
                image.src = defaultImageSrc; // Remet l'image par défaut
                message.textContent = "Fichier trop volumineux !"; // Message d'erreur
                message.style.color = "orange"; // Couleur orange pour avertir
            }
        } else {
            // Si le fichier n'est pas une image au format PNG ou JPEG
            image.src = defaultImageSrc; // Remet l'image par défaut
            image.style.borderRadius = "50%";
            message.textContent = "Type de fichier non accepté"; // Message d'erreur
            message.style.color = "red"; // Couleur rouge pour indiquer une erreur
        }
    }
}

// Ajoute un écouteur d'événement sur le formulaire pour intercepter la soumission
formulaire.addEventListener("submit", (event) => {
    event.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire

    console.log("Événement submit déclenché"); // Vérification dans la console pour voir si l'événement se déclenche bien

    // Définition des règles de validation sous forme d'objet
    let validations = {
        email: {
            regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: "Veuillez entrer un email valide (exemple : nom@domaine.com)."
        },
        github: {
            regex: /^(?!-)[a-zA-Z0-9-]{1,39}(?<!-)$/,
            message: "Nom GitHub invalide (1-39 caractères, sans tirets au début/fin)."
        },
        fullName: {
            regex: /^[a-zA-ZÀ-ÖØ-öø-ÿ' -]{2,50}$/,
            message: "Le nom complet doit contenir entre 2 et 50 caractères."
        }
    };

    // Vérifie tous les champs avec la fonction générique validerChamp()
    let validerEmail = validerChamp(email, validations.email.regex, emailErreur, validations.email.message);
    let validerNomGithub = validerChamp(nomGithub, validations.github.regex, githubErreur, validations.github.message);
    let validerNom = validerChamp(nomComplet, validations.fullName.regex, nomErreur, validations.fullName.message);

    // Si tous les champs sont valides, on envoie le formulaire
    if (validerEmail && validerNomGithub && validerNom) {
      
        // Récupération des valeurs du formulaire
        const nom = nomComplet.value;
        const emailValue = email.value;
        const imageCharger = image.src;
        const nomGithubSurTicket = nomGithub.value;
        // Affichage des informations dans la confirmation
        confirmationName.textContent = nom;
        confirmationEmail.textContent = emailValue;
        confirmationImage.src = imageCharger;
        confirmationGithub.textContent = nomGithubSurTicket;
        confirmationNameTicket.textContent = nom;

        // Masquer le formulaire et afficher la confirmation
        Conteneur.style.display = "none";
        confirmation.style.display = "block";

        // Démarrage du compte à rebours (optionnel)
        //demarrerCompteARebours();
        
        // Pas besoin d'envoyer les données, car il n'y a pas d'endpoint
        console.log("Formulaire validé, mais aucune donnée n'est envoyée.");
    } else {
        alert("Veuillez corriger vos erreurs !"); // Message d'erreur si un champ est invalide
    }
});

/**
 * Fonction pour valider un champ selon une expression régulière et afficher un message d'erreur spécifique
 * @param {HTMLInputElement} input - L'élément input à valider
 * @param {RegExp} regex - L'expression régulière utilisée pour la validation
 * @param {HTMLElement} errorElement - L'élément qui affichera le message d'erreur
 * @param {string} errorMessage - Le message d'erreur à afficher
 * @returns {boolean} - Retourne true si le champ est valide, sinon false
 */
function validerChamp(input, regex, errorElement, errorMessage) {
    let valeur = input.value.trim();

    // Vérifie si le champ est vide
    if (valeur === "") {
        input.classList.add("incorrect");
        input.classList.remove("correct");
        errorElement.textContent = "Ce champ est obligatoire.";
        return false;
    }

    // Teste si la valeur du champ correspond à l'expression régulière
    if (regex.test(valeur)) {
        input.classList.add("correct");
        input.classList.remove("incorrect");
        errorElement.textContent = ""; // Supprime le message d'erreur
        return true;
    } else {
        input.classList.add("incorrect");
        input.classList.remove("correct");
        errorElement.textContent = errorMessage;
        return false;
    }
};

// Fonction pour démarrer un compte à rebours (corrigée)
/**function demarrerCompteARebours() {
    let tempsRestant = 600; // 10 minutes en secondes

    const timer = setInterval(() => {
        // Calcul des heures, minutes et secondes
        const heures = Math.floor(tempsRestant / 3600);
        const minutes = Math.floor((tempsRestant % 3600) / 60);
        const secondes = tempsRestant % 60;

        // Affichage du temps au format HH:MM:SS
        confirmationTimer.textContent = `${String(heures).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secondes).padStart(2, "0")}`;

        // Arrêt du timer quand il atteint 0
        if (tempsRestant <= 0) {
            clearInterval(timer);
            confirmationTimer.textContent = "00:00:00";
        } else {
            tempsRestant--; // Décrémente le temps restant
        }
    }, 1000); // Mise à jour toutes les secondes
}**/

// Initialiser jsPDF
const { jsPDF } = window.jspdf;

downloadPdf.addEventListener('click', async () => {
    try {
        // Ajoute la classe pour désactiver le pseudo-élément
        ticket.classList.add("no-before");
       //console.log('1. Début de la génération du PDF');
        
        // Afficher un message de chargement
        downloadPdf.textContent = 'Génération du PDF...';
        downloadPdf.disabled = true;

        // Options pour html2canvas
        const options = {
            scale: 2, // Augmente la résolution
            useCORS: true, // Autorise les images externes
            logging: true, // Active les logs pour le débogage
            backgroundColor: '#fff' // Fond blanc pour meilleure qualité
        };
        
        //console.log('2. Début de la capture avec html2canvas');
        const canvas = await html2canvas(ticket, options);
        //console.log('3. Canvas généré avec succès');
        
        // Obtenir les dimensions
        const imgData = canvas.toDataURL('image/png');
        //console.log('4. Image convertie en base64');

        // Dimensions fixes pour un meilleur résultat
        const pdfWidth = 210; // A4 largeur
        const pdfHeight = 297; // A4 hauteur
        const ticketWidth = 180; // Largeur souhaitée du ticket dans le PDF
        const ticketHeight = (canvas.height * ticketWidth) / canvas.width;

        //console.log('5. Création du document PDF');
        const pdf = new jsPDF({
            orientation: 'portrait', //Orientation
            unit: 'mm', //Unité
            format: 'a4' // Format
        });

        // Centrer le ticket dans la page
        const x = (pdfWidth - ticketWidth) / 2;
        const y = (pdfHeight - ticketHeight) / 2;

        //console.log('6. Ajout de l\'image au PDF');
        pdf.addImage(imgData, 'PNG', x, y, ticketWidth, ticketHeight);

        //console.log('7. Sauvegarde du PDF');
        pdf.save('Ticket_Conference_Codage.pdf');
        
        // Retire la classe une fois la capture terminée
        ticket.classList.remove("no-before");
        // Restaurer le bouton
        downloadPdf.textContent = 'Télécharger mon ticket';
        downloadPdf.disabled = false;
        
        //console.log('8. Génération terminée avec succès');
        
    } catch (error) {
        //console.error('Erreur détaillée:', error);
        downloadPdf.textContent = 'Erreur - Réessayer';
        downloadPdf.disabled = false;
        alert('Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.');
    }
});