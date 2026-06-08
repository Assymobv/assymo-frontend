/**
 * Centralized Admin UI Strings
 *
 * All Dutch language strings for the admin interface.
 * Access via t() helper: t('admin.buttons.save')
 *
 * Consolidation standards applied:
 * - "Bewaren" for save (not "Opslaan")
 * - "Versturen" for send
 * - "Laden..." for loading
 * - "Verwijderen..." for deletion loading
 */

export const ADMIN_STRINGS = {
  admin: {
    /**
     * Action buttons throughout the admin interface
     */
    buttons: {
      save: "Bewaren",
      savePricing: "Prijzen bewaren",
      saving: "Bewaren...",
      cancel: "Annuleren",
      delete: "Verwijderen",
      deleting: "Verwijderen...",
      add: "Toevoegen",
      edit: "Bewerken",
      print: "Afdrukken",
      create: "Aanmaken",
      creating: "Aanmaken...",
      back: "Terug",
      backToLogin: "Terug naar inloggen",
      goToLogin: "Naar inloggen",
      login: "Inloggen",
      logout: "Uitloggen",
      send: "Versturen",
      sending: "Versturen...",
      sendLink: "Link versturen",
      verify: "Verifiëren",
      verifying: "Verifiëren...",
      upload: "Upload",
      uploading: "Uploaden...",
      library: "Bibliotheek",
      forgotPassword: "Wachtwoord vergeten?",
      addButton: "Knop toevoegen",
      removeButton: "Knop verwijderen",
      addItem: "Item toevoegen",
      removeItem: "Item verwijderen",
      addImage: "Afbeelding toevoegen",
      addBlock: "Blok toevoegen",
      removeBlock: "Blok verwijderen",
      addSection: "Sectie toevoegen",
      generateAlt: "Genereer alt-tekst",
      generating: "Genereren...",
      sendTest: "Test versturen",
      duplicate: "Dupliceren",
      copy: "Kopiëren",
      paste: "Plakken",
      skip: "Overslaan",
      continue: "Doorgaan",
      confirm: "Bevestigen",
      copied: "Gekopieerd",
      copyCodes: "Kopieer codes",
      copySetupCode: "Kopieer setup code",
      changePassword: "Wachtwoord wijzigen",
      changePhoto: "Foto wijzigen",
      addPasskey: "Passkey toevoegen",
      saveToLibrary: "Bewaren in bibliotheek",
      download: "Downloaden",
      new: "Nieuw",
    },

    /**
     * Form field labels
     */
    labels: {
      title: "Titel",
      name: "Naam",
      email: "E-mailadres",
      password: "Wachtwoord",
      newPassword: "Nieuw wachtwoord",
      confirmPassword: "Herhaal wachtwoord",
      confirmNewPassword: "Bevestig nieuw wachtwoord",
      currentPassword: "Huidig wachtwoord",
      subtitle: "Subtitel",
      image: "Afbeelding",
      url: "URL",
      linkUrl: "Link URL",
      slug: "Slug",
      label: "Label",
      icon: "Icoon",
      variant: "Variant",
      text: "Tekst",
      description: "Beschrijving",
      action: "Actie",
      actionOptional: "Actie (optioneel)",
      actions: "Acties",
      status: "Status",
      date: "Datum",
      time: "Tijd",
      from: "Van",
      to: "Tot",
      slotDuration: "Slot (min)",
      reason: "Reden",
      filters: "Filters",
      features: "Functies",
      subitems: "Subitems",
      items: "Items",
      images: "Afbeeldingen",
      caption: "Onderschrift",
      layout: "Layout",
      verticalAlign: "Verticale uitlijning",
      background: "Achtergrond",
      leftColumn: "Linker kolom",
      rightColumn: "Rechter kolom",
      blocks: "Blokken",
      headingLevel: "Titel niveau",
      subject: "Onderwerp",
      preview: "Preview",
      customerDetails: "Klantgegevens",
      remarks: "Opmerkingen",
      adminNotes: "Interne notities",
      submenuHeading: "Submenu heading",
      phone: "Telefoonnummer",
      phoneShort: "Telefoon",
      streetAndNumber: "Straat en huisnummer",
      postalCode: "Postcode",
      place: "Plaats",
      city: "Plaats",
      streetAddress: "Straat en huisnummer",
      customerRemarks: "Opmerkingen klant",
      internalNotes: "Interne notities",
      role: "Rol",
      startDate: "Begindatum",
      endDate: "Einddatum",
      sendConfirmationEmail: "Bevestigingsmail naar klant sturen",
      vatNumber: "BTW-nummer",
      hostname: "Hostname",
      address: "Adres",
      instagramUrl: "Instagram URL",
      facebookUrl: "Facebook URL",
      domain: "Domein",
      showBackground: "Toon achtergrond",
      showImage: "Toon afbeelding",
      showButtons: "Toon acties",
      openChatbot: "Open chatbot",
      openConfigurator: "Open configurator",
      isClosed: "Is gesloten",
      showOnWebsite: "Toon op website",
      isRecurring: "Jaarlijks terugkerend",
      filename: "Bestandsnaam",
      altText: "Alt-tekst",
      profilePhoto: "Profielfoto",
      metaTitle: "SEO titel",
      metaDescription: "Meta beschrijving",
      version: "Versie",
      versions: "Versies",
      model: "Model",
      size: "Formaat",
      quality: "Kwaliteit",
      questionKey: "Vraag sleutel",
      questionType: "Type vraag",
      required: "Verplicht",
      product: "Product",
      allProducts: "Alle producten",
      priceModifiers: "Prijsmodifiers",
      priceEstimate: "Prijsindicatie",
      hasAppointment: "Afspraak",
      customer: "Klant",
      configuration: "Configuratie",
      catalogueCategory: "Categorie",
      unit: "Eenheid",
      pricePerM2: "Prijs per m\u00B2",
      pricePerUnit: "Prijs per eenheid",
      startingPrice: "Vanafprijs",
      price: "Prijs",
      optionPrice: "Optieprijs",
      fromCatalogue: "Uit catalogus",
      manualPrice: "Handmatig",
      solution: "Realisatie",
    },

    /**
     * Page titles and section headings
     */
    headings: {
      login: "Inloggen",
      verification: "Verificatie",
      resetPassword: "Reset wachtwoord",
      newPassword: "Nieuw wachtwoord",
      passwordChanged: "Wachtwoord gewijzigd",
      linkInvalid: "Link ongeldig",
      twoStepVerification: "Tweestapsverificatie",
      emailSent: "E-mail verstuurd",
      overview: "Overzicht",
      openingHours: "Openingsuren",
      exceptions: "Uitzonderingen",
      newAppointment: "Nieuwe afspraak",
      editAppointment: "Afspraak bewerken",
      addOverride: "Uitzondering toevoegen",
      editCategory: "Categorie bewerken",
      newCategory: "Nieuwe categorie",
      editLink: "Link bewerken",
      newLink: "Nieuwe link",
      editSite: "Site bewerken",
      newSite: "Nieuwe site",
      newUser: "Nieuwe gebruiker",
      selectImage: "Selecteer afbeelding",
      newFolder: "Nieuwe map",
      renameFolder: "Map hernoemen",
      conversation: "Conversatie",
      deleteDocument: "Document verwijderen",
      deleteSection: "Sectie verwijderen",
      deleteSectionQuestion: "Sectie verwijderen?",
      sendNewsletter: "Nieuwsbrief versturen",
      sendTestEmail: "Test e-mail versturen",
      deleteNewsletter: "Nieuwsbrief verwijderen",
      deleteDraft: "Concept verwijderen",
      profile: "Profiel",
      passkeys: "Passkeys",
      twoFactorAuth: "Twee-factor authenticatie",
      deletePasskey: "Passkey verwijderen",
      seo: "SEO",
      general: "Algemeen",
      unsavedChanges: "Niet-opgeslagen wijzigingen",
      categories: "Categorieën",
      priceCatalogue: "Prijscatalogus",
      questions: "Vragen",
      rules: "Regels",
      pricing: "Prijzen",
      submissions: "Aanvragen",
      steps: "Stappen",
      newStep: "Nieuwe stap",
      editStep: "Stap bewerken",
      newQuestion: "Nieuwe vraag",
      editQuestion: "Vraag bewerken",
      editItem: "Item bewerken",
      catalogue: "Prijscatalogus",
      newCatalogueItem: "Nieuw catalogusitem",
      editCatalogueItem: "Catalogusitem bewerken",
      list: "Lijst",
      calendar: "Kalender",
    },

    /**
     * Success and error toast messages
     * Parameterized messages use {param} syntax
     */
    messages: {
      // Success messages
      settingsSaved: "Instellingen opgeslagen",
      parametersSaved: "Parameters opgeslagen",
      appointmentCreated: "Afspraak aangemaakt",
      appointmentUpdated: "Afspraak bijgewerkt",
      appointmentCancelled: "Afspraak geannuleerd",
      appointmentDeleted: "Afspraak verwijderd",
      overrideAdded: "Uitzondering toegevoegd",
      overrideDeleted: "Uitzondering verwijderd",
      categoryUpdated: "Categorie bijgewerkt",
      categoryCreated: "Categorie aangemaakt",
      categoryDeleted: "Categorie verwijderd",
      filterAdded: "Filter toegevoegd",
      filterDeleted: "Filter verwijderd",
      linkUpdated: "Link bijgewerkt",
      linkCreated: "Link aangemaakt",
      linkDeleted: "Link verwijderd",
      subitemAdded: "Subitem toegevoegd",
      subitemDeleted: "Subitem verwijderd",
      pageSaved: "Pagina opgeslagen",
      pageDeleted: "Pagina verwijderd",
      pageDuplicated: "Pagina gedupliceerd",
      solutionSaved: "Realisatie opgeslagen",
      solutionDeleted: "Realisatie verwijderd",
      solutionDuplicated: "Realisatie gedupliceerd",
      imageSaved: "Afbeelding opgeslagen",
      imageDeleted: "Afbeelding verwijderd",
      imageUploaded: "Afbeelding geupload",
      imageMoved: "Afbeelding verplaatst",
      altGenerated: "Alt-tekst gegenereerd",
      folderCreated: "Map aangemaakt",
      folderRenamed: "Map hernoemd",
      folderDeleted: "Map verwijderd",
      draftSaved: "Concept opgeslagen",
      draftCreated: "Nieuw concept aangemaakt",
      draftDeleted: "Concept verwijderd",
      newsletterDeleted: "Nieuwsbrief verwijderd",
      siteDeleted: "Site verwijderd",
      userCreated: "Gebruiker aangemaakt.",
      userUpdated: "Gebruiker bijgewerkt",
      userDeleted: "Gebruiker verwijderd",
      passwordChanged: "Wachtwoord gewijzigd",
      nameChanged: "Naam gewijzigd",
      avatarChanged: "Profielfoto gewijzigd",
      passkeyAdded: "Passkey toegevoegd",
      passkeyDeleted: "Passkey verwijderd",
      twoFactorEnabled: "Twee-factor authenticatie ingeschakeld",
      twoFactorDisabled: "Twee-factor authenticatie uitgeschakeld",
      loggedOut: "Uitgelogd",
      documentDeleted: "Document verwijderd",
      sectionCopied: "Sectie gekopieerd",
      sectionDuplicated: "Sectie gedupliceerd",
      sectionPasted: "Sectie geplakt",
      metaDescriptionGenerated: "Meta beschrijving gegenereerd",
      metaDescriptionGenerateFailed: "Kon meta beschrijving niet genereren",
      imageGenerated: "Afbeelding gegenereerd",
      imageGenerateFailed: "Kon afbeelding niet genereren",
      stepCreated: "Stap aangemaakt",
      stepUpdated: "Stap bijgewerkt",
      stepDeleted: "Stap verwijderd",
      stepSaveFailed: "Kon stap niet opslaan",
      stepDeleteFailed: "Kon stap niet verwijderen",
      stepsLoadFailed: "Kon stappen niet laden",
      questionCreated: "Vraag aangemaakt",
      questionUpdated: "Vraag bijgewerkt",
      questionDeleted: "Vraag verwijderd",
      pricingSaved: "Prijzen opgeslagen",
      questionSaveFailed: "Kon vraag niet opslaan",
      questionDeleteFailed: "Kon vraag niet verwijderen",
      questionsLoadFailed: "Kon vragen niet laden",
      pricingLoadFailed: "Kon prijzen niet laden",
      pricingSaveFailed: "Kon prijzen niet opslaan",
      submissionsLoadFailed: "Kon aanvragen niet laden",
      itemCreated: "Item aangemaakt",
      itemUpdated: "Item bijgewerkt",
      itemDeleted: "Item verwijderd",
      itemDuplicated: "Item gedupliceerd",
      itemSaveFailed: "Kon item niet opslaan",
      catalogueItemCreated: "Catalogusitem aangemaakt",
      catalogueItemUpdated: "Catalogusitem bijgewerkt",
      catalogueItemDeleted: "Catalogusitem verwijderd",
      catalogueItemSaveFailed: "Kon catalogusitem niet opslaan",
      catalogueItemDeleteFailed: "Kon catalogusitem niet verwijderen",
      catalogueLoadFailed: "Kon catalogus niet laden",
      itemDeleteFailed: "Kon item niet verwijderen",
      itemDuplicateFailed: "Kon item niet dupliceren",

      // Validation errors
      fillAllFields: "Vul alle velden in",
      fillAllFieldsAuth: "Vul alle velden in.",
      fillBothFields: "Vul beide velden in.",
      addAtLeastOneOption: "Voeg minstens één optie toe",
      passwordMismatch: "Wachtwoorden komen niet overeen",
      passwordMinLength: "Wachtwoord moet minimaal 8 tekens zijn",
      passwordMinLengthWithPeriod: "Wachtwoord moet minimaal 8 tekens zijn.",
      passwordMismatchWithPeriod: "Wachtwoorden komen niet overeen.",
      currentPasswordWrong: "Huidig wachtwoord is onjuist",
      nameRequired: "Naam mag niet leeg zijn",
      nameEmailRequired: "Naam en email zijn verplicht",
      nameSlugRequired: "Naam en slug zijn verplicht",
      titleRequired: "Titel is verplicht",
      slugRequired: "Slug is verplicht voor niet-homepage pagina's",
      selectDate: "Selecteer een datum",
      selectEndDate: "Selecteer een einddatum",
      selectDateTime: "Selecteer een datum en tijd",
      customerDataRequired: "Vul alle verplichte klantgegevens in",
      addressRequired: "Vul het volledige adres in",
      emailRequired: "Vul een e-mailadres in",
      emailInvalid: "Vul een geldig e-mailadres in",
      enterEmail: "Vul je e-mailadres in.",
      enter6DigitCode: "Vul een 6-cijferige code in.",
      subjectRequired: "Vul een onderwerp in",
      contentRequired: "Voeg content toe aan minimaal één sectie",
      noSubscribers: "Er zijn geen abonnees om naar te verzenden",
      sectionRequired: "Je hebt minimaal één sectie nodig",
      selectDocument: "Selecteer eerst een document",
      selectMarkdown: "Selecteer een Markdown (.md) bestand",
      enterTestQuery: "Voer een test query in",
      enterName: "Vul een naam in",
      fileMustBeImage: "Bestand moet een afbeelding zijn",
      imageMaxSize: "Afbeelding mag maximaal 25MB zijn",
      imageMaxSize2MB: "Afbeelding mag maximaal 2MB zijn",
      imagesOnly: "Alleen afbeeldingen zijn toegestaan",

      // Operation errors
      uploadFailed: "Upload mislukt",
      deleteFailed: "Verwijderen mislukt",
      searchFailed: "Zoeken mislukt",
      invalidCredentials: "Ongeldige e-mail of wachtwoord.",
      accountNotFound: "Geen account gevonden met dit e-mailadres.",
      invalidLogin: "Ongeldige inloggegevens.",
      invalidCode: "Ongeldige code. Probeer opnieuw.",
      somethingWentWrong: "Er is iets misgegaan. Probeer het opnieuw.",
      somethingWentWrongShort: "Er is iets misgegaan",
      errorOccurred: "Er is een fout opgetreden",

      // Load errors
      settingsLoadFailed: "Kon instellingen niet laden",
      settingsSaveFailed: "Kon instellingen niet opslaan",
      appointmentsLoadFailed: "Kon afspraken niet laden",
      overridesLoadFailed: "Kon overrides niet laden",
      availabilityLoadFailed: "Kon beschikbaarheid niet laden",
      documentInfoLoadFailed: "Kon documentinformatie niet laden",
      categoriesLoadFailed: "Kon categorieën niet laden",
      navigationLoadFailed: "Kon navigatie niet laden",
      sitesLoadFailed: "Kon sites niet laden",
      usersLoadFailed: "Kon gebruikers niet laden",
      pagesLoadFailed: "Kon pagina's niet ophalen",
      pageLoadFailed: "Kon pagina niet ophalen",
      dataLoadFailed: "Kon gegevens niet ophalen",
      solutionsLoadFailed: "Kon realisaties niet ophalen",
      mediaLoadFailed: "Kon media niet ophalen",
      imageLoadFailed: "Kon afbeelding niet ophalen",
      newsletterLoadFailed: "Kon nieuwsbrief niet laden",
      draftsLoadFailed: "Kon concepten niet laden",

      // Access errors
      noUserAccess: "Geen toegang tot gebruikersbeheer",
      noSiteAccess: "Geen toegang tot sitebeheer",

      // Save/delete errors
      categorySaveFailed: "Kon categorie niet opslaan",
      filterAddFailed: "Kon filter niet toevoegen",
      filterDeleteFailed: "Kon filter niet verwijderen",
      categoryDeleteFailed: "Kon categorie niet verwijderen",
      linkSaveFailed: "Kon link niet opslaan",
      linkDeleteFailed: "Kon link niet verwijderen",
      subitemAddFailed: "Kon subitem niet toevoegen",
      subitemDeleteFailed: "Kon subitem niet verwijderen",
      orderSaveFailed: "Kon volgorde niet opslaan",
      pageDeleteFailed: "Kon pagina niet verwijderen",
      pageSaveFailed: "Kon pagina niet opslaan",
      solutionDeleteFailed: "Kon realisatie niet verwijderen",
      solutionSaveFailed: "Kon realisatie niet opslaan",
      imageSaveFailed: "Kon afbeelding niet opslaan",
      imageDeleteFailed: "Kon afbeelding niet verwijderen",
      imageMoveFailed: "Kon afbeelding niet verplaatsen",
      altGenerateFailed: "Kon alt-tekst niet genereren",
      folderCreateFailed: "Kon map niet aanmaken",
      folderRenameFailed: "Kon map niet hernoemen",
      addSections:
        "Voeg secties toe om de inhoud van deze pagina op te bouwen.",
      folderDeleteFailed: "Kon map niet verwijderen",
      draftSaveFailed: "Kon concept niet opslaan",
      draftCreateFailed: "Kon concept niet aanmaken",
      draftDeleteFailed: "Kon concept niet verwijderen",
      newsletterDeleteFailed: "Kon nieuwsbrief niet verwijderen",
      avatarUploadFailed: "Kon profielfoto niet uploaden",
      passkeyAddFailed: "Kon passkey niet toevoegen",
      passkeyDeleteFailed: "Kon passkey niet verwijderen",
      passwordChangeFailed: "Kon wachtwoord niet wijzigen",
      nameSaveFailed: "Kon naam niet wijzigen",

      // Not found errors
      newsletterNotFound: "Nieuwsbrief niet gevonden",
      solutionNotFound: "Realisatie niet gevonden",
      pageNotFound: "Pagina niet gevonden",
      imageNotFound: "Afbeelding niet gevonden",
    },

    /**
     * Input field placeholders
     */
    placeholders: {
      emailExample: "admin@assymo.be",
      fullName: "Volledige naam",
      emailFormat: "email@voorbeeld.be",
      testEmail: "test@voorbeeld.be",
      phoneFormat: "0412 34 56 78",
      phoneFormat2: "+32 123 45 67 89",
      streetFormat: "Straatnaam 123",
      postalCode: "1234",
      city: "Plaatsnaam",
      companyEmail: "info@assymo.be",
      vatFormat: "BE 0123.456.789",
      categoryName: "Materiaal",
      categorySlug: "materiaal",
      newFilter: "Nieuwe filter...",
      linkLabel: "Bijv. Producten",
      linkSlug: "bijv-producten",
      submenuHeading: "Ontdek",
      addSolution: "Voeg solution toe...",
      solutionName: "Realisatie naam",
      optionalSubtitle: "Optionele subtitel",
      optionalTitle: "Optionele titel",
      pageTitle: "Pagina titel",
      formTitle: "Formulier titel",
      itemTitle: "Item titel",
      title: "Titel",
      description: "Beschrijving",
      filename: "Bestandsnaam",
      altDescription: "Beschrijving van de afbeelding voor toegankelijkheid",
      searchFilename: "Zoek op bestandsnaam...",
      searchAlt: "Zoeken op naam of alt tekst...",
      searchAppointments: "Zoek op naam, email of telefoon...",
      sectionTitle: "Sectie titel",
      buttonLabel: "bijv. Bekijk meer",
      emailPreview: "Korte preview tekst die in de inbox wordt getoond",
      emailSubject: "bijv. Winterkorting op alle tuinhuizen",
      overrideReason: "bijv. Feestdag, Vakantie...",
      holidayVacation: "bijv. Feestdag, Vakantie...",
      customerRemarks: "Eventuele opmerkingen van de klant...",
      adminOnly: "Alleen zichtbaar voor beheerders...",
      testQuery: "bijv. Wat zijn jullie openingstijden?",
      folderName: "Mapnaam",
      siteName: "Mijn Site",
      siteSlug: "mijn-site",
      hostname: "www.example.com",
      userName: "Jan Janssen",
      userEmail: "jan@example.com",
      selectIcon: "Kies icoon",
      selectTemplate: "Selecteer een template",
      selectSite: "Selecteer site",
      status: "Status",
      solutionsHeading: "Onze realisaties",
      solutionsSubtitle: "Bekijk onze projecten",
      uspHeading: "Waarom kiezen voor ons?",
      moreInfo: "Meer info",
      contactUrl: "/contact",
      pageUrl: "/pagina",
      viewMore: "Bekijk meer",
      askQuestion: "Stel een vraag",
      makeAppointment: "Maak een afspraak",
      buttonText: "Knop tekst",
      optional: "Optioneel",
      metaTitlePlaceholder: "Aangepaste titel voor zoekmachines",
      metaDescriptionPlaceholder:
        "Korte beschrijving voor zoekmachines (max 160 tekens)",
      describeEdit: "Beschrijf je wijziging...",
      questionLabel: "Wat wilt u weten?",
      questionKey: "vraag-sleutel",
      optionLabel: "Optie label",
      optionValue: "optie-waarde",
      priceModifier: "0",
      catalogueItemName: "Bijv. Vast raam",
      catalogueCategory: "Bijv. Ramen",
      unitExample: "Bijv. per stuk, per m\u00B2",
      selectCatalogueItem: "Selecteer catalogusitem",
      noCatalogueItem: "Geen (handmatig)",
      selectSolution: "Selecteer realisatie",
    },

    /**
     * Empty state messages
     */
    empty: {
      noConversations: "Nog geen conversaties",
      noButtons: "Nog geen knoppen toegevoegd",
      noImages: "Nog geen afbeeldingen toegevoegd",
      noUsps: "Nog geen USPs toegevoegd",
      noBlocks: "Nog geen blokken toegevoegd",
      noFilters: "Nog geen filters in deze categorie",
      noSubitems: "Nog geen subitems",
      noResults: "Geen resultaten gevonden",
      folderEmpty: "Deze map is leeg",
      noLibraryImages: "Geen afbeeldingen in bibliotheek",
      closed: "Gesloten",
      noImageYet: "Nog geen afbeelding",
      noImageYetDesc:
        "Upload een afbeelding of selecteer er één uit de bibliotheek om te beginnen.",
      noSteps: "Nog geen stappen",
      noStepsDesc: "Voeg stappen toe om vragen te groeperen in aparte pagina's.",
      noQuestions: "Nog geen vragen",
      noQuestionsDesc: "Voeg vragen toe om de configurator te bouwen.",
      noOptions: "Nog geen opties",
      noSubmissions: "Nog geen aanvragen",
      noSubmissionsDesc: "Aanvragen verschijnen hier zodra klanten de configurator invullen.",
      noPricing: "Nog geen prijzen",
      noPricingDesc: "Configureer de prijzen voor dit product.",
      noCategories: "Nog geen configurator items",
      noCategoriesDesc: "Maak een nieuw item aan om te beginnen.",
      addSelectQuestionsForModifiers: "Voeg keuzevragen toe om prijsmodifiers in te stellen.",
      noCatalogueItems: "Nog geen catalogusitems",
      noCatalogueItemsDesc: "Voeg items toe aan de prijscatalogus.",
      noSolutionSelected: "Geen realisatie geselecteerd",
      noRules: "Geen regels",
      noRulesDesc: "Voeg regels toe om vragen conditioneel te tonen.",
    },

    /**
     * Loading state indicators
     */
    loading: {
      default: "Laden...",
      saving: "Bewaren...",
      deleting: "Verwijderen...",
      creating: "Aanmaken...",
      sending: "Versturen...",
      uploading: "Uploaden...",
      verifying: "Verifiëren...",
      generating: "Genereren...",
    },

    /**
     * Dialog and AlertDialog content
     * Parameterized strings use {param} syntax
     */
    dialogs: {
      cancelAppointmentDesc:
        "Weet je zeker dat je deze afspraak wilt annuleren? De klant ontvangt een annuleringsmail.",
      editSectionDesc: "Bewerk de inhoud van deze sectie.",
      newAppointmentDesc:
        "Maak handmatig een nieuwe afspraak aan voor een klant.",
      overrideDesc:
        "Sluit de zaak op een specifieke datum of wijzig de openingstijden.",
      editCategoryDesc:
        "Bewerk de categorie en beheer de bijbehorende filters.",
      newCategoryDesc: "Maak een nieuwe filtercategorie aan.",
      editLinkDesc: "Bewerk de navigatie link en bijbehorende subitems.",
      newLinkDesc: "Maak een nieuwe navigatie link aan.",
      permanentDelete: "wordt permanent verwijderd.",
      deleteWithFilters:
        "en alle bijbehorende filters worden permanent verwijderd.",
      deleteWithSubitems:
        "en alle bijbehorende subitems worden permanent verwijderd.",
      confirmDelete: "Weet je zeker dat je dit wilt verwijderen?",
      cannotUndo: "Dit kan niet ongedaan gemaakt worden.",
      userWillReceiveEmail:
        "De gebruiker ontvangt een email om een wachtwoord in te stellen.",
      userCannotLogin: "De gebruiker kan daarna niet meer inloggen.",
      resetEmailDesc:
        "Als er een account bestaat met het e-mailadres, ontvang je binnen enkele minuten een link om je wachtwoord te resetten.",
      resetEmailHint:
        "We sturen je een e-mail met een link om je wachtwoord te resetten",
      enter2faCode: "Vul de 6-cijferige code uit je authenticator app in.",
      resetLinkExpired:
        "Deze reset link is verlopen of ongeldig. Vraag een nieuwe link aan.",
      noValidResetLink: "Geen geldige reset link. Vraag een nieuwe link aan.",
      noValidResetLinkShort: "Geen geldige reset link.",
      passwordSuccessfullyChanged:
        "Je wachtwoord is succesvol gewijzigd. Je kunt nu inloggen met je nieuwe wachtwoord.",
      minChars: "Minimaal 8 tekens",
      twoStepDesc:
        "Stel een extra beveilingsmethode in om je account beter te beveiligen.",
      authenticatorApp: "Authenticator app",
      authenticatorAppDesc:
        "Gebruik een app zoals Google Authenticator of 1Password",
      passkeyMethod: "Passkey",
      passkeyMethodDesc:
        "Gebruik je vingerafdruk, gezichtsscan of schermvergrendeling",
      errorOops: "Oeps, foutje",
      confirmYourPassword: "Bevestig je wachtwoord",
      backupCodes: "Backup codes",
      backupCodesDesc:
        "Bewaar deze codes op een veilige plek. Je kunt ze gebruiken als je geen toegang hebt tot je authenticator app.",
      scanTheCode: "Scan de code",
      scanTheCodeDesc:
        "Scan deze met je authenticator app (bijv. Google Authenticator, Authy, 1Password).",
      enterCodeToConfirm: "Voer de 6-cijferige code in om te bevestigen",
      addPasskey: "Passkey toevoegen",
      addPasskeyDesc:
        "Voeg een passkey toe om in te loggen met FaceID, TouchID of de toegangscode van je toestel.",
      enterYourPassword: "Vul je wachtwoord in.",
      invalidPassword: "Ongeldig wachtwoord.",
      could2faNotEnable: "Kon 2FA niet inschakelen.",
      couldPasskeyNotAdd: "Kon passkey niet toevoegen. Probeer opnieuw.",
      couldAppointmentNotCreate: "Kon afspraak niet aanmaken",
      formBlockDesc:
        "Dit blok toont het contactformulier met een optionele titel en subtitel.",
      unsavedVersionsDesc:
        "Je hebt onopgeslagen versies. Weet je zeker dat je opnieuw wilt beginnen?",
      submenuHeadingHint:
        "Enkel invullen indien er subitems aanwezig zijn voor deze link.",
    },

    /**
     * Sidebar navigation labels
     */
    nav: {
      dashboard: "Dashboard",
      content: "Content",
      pages: "Pagina's",
      solutions: "Realisaties",
      media: "Media",
      imageStudio: "Media Studio",
      navigation: "Navigatie",
      filters: "Filters",
      parameters: "Parameters",
      configurator: "Configurator",
      appointments: "Afspraken",
      conversations: "Conversaties",
      emails: "E-mails",
      settings: "Instellingen",
      users: "Gebruikers",
      sites: "Sites",
      account: "Mijn Account",
    },

    /**
     * Table column headers
     */
    table: {
      session: "Session",
      messages: "Berichten",
      lastActivity: "Laatste activiteit",
      avgResponseTime: "Gem. responstijd",
      messagesUnit: "berichten",
      questionSingular: "vraag",
      questionPlural: "vragen",
    },

    /**
     * Section type labels for page builder
     */
    sections: {
      pageHeader: "Page Header",
      slideshow: "Slideshow",
      solutionsScroller: "Realisaties Scroller",
      splitSection: "Split Section",
      uspSection: "USPs",
      flexibleSection: "Flexibele Sectie",
      solutionHighlight: "Realisatie",
    },

    /**
     * Day names for appointment scheduling
     */
    days: {
      monday: "Maandag",
      mondayShort: "Ma",
      tuesday: "Dinsdag",
      tuesdayShort: "Di",
      wednesday: "Woensdag",
      wednesdayShort: "Wo",
      thursday: "Donderdag",
      thursdayShort: "Do",
      friday: "Vrijdag",
      fridayShort: "Vr",
      saturday: "Zaterdag",
      saturdayShort: "Za",
      sunday: "Zondag",
      sundayShort: "Zo",
    },

    /**
     * Appointment status labels
     */
    status: {
      confirmed: "Bevestigd",
      cancelled: "Geannuleerd",
      completed: "Afgerond",
    },

    /**
     * Miscellaneous UI labels
     */
    misc: {
      primary: "Primair",
      secondary: "Secundair",
      top: "Boven",
      center: "Midden",
      bottom: "Onder",
      col1: "1 kolom",
      col2Equal: "2 kolommen (gelijk)",
      col2LeftWide: "2 kolommen (links breed)",
      col2RightWide: "2 kolommen (rechts breed)",
      text: "Tekst",
      image: "Afbeelding",
      map: "Kaart",
      form: "Formulier",
      none: "Geen",
      ip: "IP:",
      item: "Item",
      items: "items",
      general: "Algemeen",
      testEmail: "Test e-mailadres",
      testEmailDesc: "Dit e-mailadres wordt gebruikt voor nieuwsbrief tests",
      testRetrieval: "Test retrieval",
      testRetrievalDesc: "Test de vector search met een voorbeeldvraag",
      selected: "Geselecteerd",
      foundChunks: "Gevonden chunks",
      chunk: "Chunk",
      characters: "tekens",
      deleteDocumentDesc:
        "Weet je zeker dat je het huidige document wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
      noDocumentUploaded:
        "Geen document geupload. Upload een Markdown bestand om te beginnen.",
      noRelevantChunks: "Geen relevante chunks gevonden voor deze query.",
      processing: "Verwerken...",
      uploading: "Uploaden",
      searching: "Zoeken...",
      search: "Zoeken",
      // Breadcrumb labels for dynamic routes
      editPage: "Pagina bewerken",
      editSolution: "Realisatie bewerken",
      editNewsletter: "Nieuwsbrief bewerken",
      viewImage: "Afbeelding bekijken",
      sections: "Secties",
      section: "Sectie",
      optional: "Optioneel",
      optionalText:
        "Optionele tekst die naast het onderwerp in de inbox verschijnt",
      deleteSection: "Sectie verwijderen",
      deleteSectionDesc:
        "Weet je zeker dat je deze sectie wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
      sendBroadcastDesc:
        "Je staat op het punt om deze nieuwsbrief te versturen naar",
      abonnee: "abonnee",
      abonnees: "abonnees",
      testSend: "Test versturen",
      testEmailDialogDesc:
        "Verstuur een test e-mail om te controleren hoe de nieuwsbrief eruitziet.",
      deleteNewsletterDesc:
        "Weet je zeker dat je deze nieuwsbrief wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
      deleteDraftDesc:
        "Weet je zeker dat je dit concept wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
      noNewsletters:
        "Nog geen nieuwsbrieven. Maak een nieuwe aan om te beginnen.",
      noSubject: "Geen onderwerp",
      sent: "Verzonden",
      draft: "Concept",
      templates: "Templates",
      newsletters: "Nieuwsbrieven",
      newNewsletter: "Nieuwe nieuwsbrief",
      deletePageQuestion: "Pagina verwijderen?",
      deletePageDesc:
        "Weet je zeker dat je deze pagina wilt verwijderen? Dit kan niet ongedaan worden gemaakt.",
      deleteSolutionQuestion: "Realisatie verwijderen?",
      deleteSolutionDesc:
        "Weet je zeker dat je deze realisatie wilt verwijderen? Dit kan niet ongedaan worden gemaakt.",
      noPagesYet: "Nog geen pagina's",
      noPagesDesc: "Maak je eerste pagina aan om te beginnen.",
      createPage: "Pagina aanmaken",
      noSolutionsYet: "Nog geen realisaties",
      noSolutionsDesc: "Maak je eerste realisatie aan om te beginnen.",
      createSolution: "Realisatie aanmaken",
      newPage: "Nieuwe pagina",
      newSolution: "Nieuwe realisatie",
      lastEdited: "Laatst bewerkt",
      openInBrowser: "Open in browser",
      setAsHomepage: "Stel in als homepage",
      headerImage: "Header afbeelding",
      created: "Aangemaakt",
      noFiltersInCategory: "Geen filters in deze categorie",
      noSitesFound: "Geen sites gevonden.",
      noSitesAvailable: "Geen sites beschikbaar",
      noUsersFound: "Geen gebruikers gevonden.",
      noSections: "Geen secties",
      clipboardEmpty: "Geen sectie gekopieerd",
      noExceptions: "Geen uitzonderingen",
      noExceptionsDesc: "Voeg uitzonderingen toe voor feestdagen of andere aangepaste openingsuren.",
      noAppointmentsFound: "Geen afspraken gevonden",
      noPasskeysRegistered: "Geen passkeys geregistreerd",
      noImagesYet: "Nog geen afbeeldingen",
      uploadFirstImage: "Upload je eerste afbeelding om te beginnen.",
      folderEmptyUpload:
        "Upload afbeeldingen om ze aan deze map toe te voegen.",
      firstImageUpload: "Eerste afbeelding uploaden",
      addImageToFolder: "Afbeelding toevoegen",
      releaseToUpload: "Laat los om te uploaden",
      deleteImageQuestion: "Afbeelding verwijderen?",
      deleteImageDesc:
        "Weet je zeker dat je deze afbeelding wilt verwijderen? Dit kan niet ongedaan worden gemaakt.",
      deleteFolderQuestion: "Map verwijderen?",
      deleteFolderDesc:
        "De afbeeldingen in deze map worden niet verwijderd, maar verplaatst naar de hoofdmap.",
      uploadedImages: "afbeelding(en) geupload",
      failedImages: "afbeelding(en) mislukt",
      altTextLabel: "Alt-tekst",
      fileSize: "Bestandsgrootte",
      uploadedOn: "Geupload op",
      accessibilityDesc:
        "Alt tekst wordt gebruikt voor toegankelijkheid en SEO",
      deleteFilterQuestion: "Filter verwijderen?",
      deleteCategoryQuestion: "Categorie verwijderen?",
      deleteSiteQuestion: "Site verwijderen?",
      deleteUserQuestion: "Gebruiker verwijderen?",
      deleteUserDesc:
        "De gebruiker verliest alle toegang en site-toewijzingen.",
      sites: "Sites",
      newUser: "Nieuwe gebruiker",
      deleteLinkQuestion: "Link verwijderen?",
      deleteOverrideQuestion: "Uitzondering verwijderen?",
      cancelAppointmentQuestion: "Afspraak annuleren?",
      cancelAppointmentEmailNotice:
        "De klant ontvangt hiervan een e-mailnotificatie.",
      noNavLinksYet: "Nog geen navigatie links",
      createNavLinkDesc:
        "Maak je eerste link aan om de navigatie te configureren.",
      createNavLink: "Link aanmaken",
      noCategoriesYet: "Nog geen categorieën",
      createCategoryDesc:
        "Maak je eerste categorie aan om filters te organiseren.",
      createCategory: "Categorie aanmaken",
      appointmentDetails: "Afspraak details",
      editAppointmentDesc: "Bekijk de afspraakgegevens of bewerk ze.",
      editingAppointmentDesc: "Bewerk de afspraakgegevens.",
      viewAppointmentDesc: "Bekijk de afspraakgegevens.",
      cancelAppointmentDesc:
        "Weet je zeker dat je deze afspraak wilt annuleren? De klant ontvangt een annuleringsmail.",
      yesCancel: "Ja, annuleer",
      deleteAppointmentQuestion: "Afspraak verwijderen?",
      deleteAppointmentDesc:
        "De afspraak verdwijnt uit het overzicht en het tijdslot komt weer vrij. De klant ontvangt een annuleringsmail. De gegevens blijven bewaard in de database.",
      yesDelete: "Ja, verwijder",
      createdOn: "Aangemaakt op",
      noCategoriesDesc:
        "Maak je eerste categorie aan om filters te organiseren.",
      deleteCategoryDesc:
        "Deze categorie en alle bijbehorende filters worden permanent verwijderd.",
      editSectionDesc: "Bewerk de inhoud van deze sectie.",
      slugHint: "Kleine letters, cijfers en koppeltekens",
      passkeysDesc:
        "Log sneller in met Face ID, Touch ID of de toegangscode van je toestel.",
      twoFactorDesc:
        "Voeg een extra beveiligingslaag toe aan je account met een authenticator app.",
      twoFactorActive: "Je account is beveiligd met 2FA",
      twoFactorInactive: "Niet ingeschakeld",
      disableTwoFactor: "Uitschakelen",
      enableTwoFactor: "Inschakelen",
      disable: "Uitschakelen",
      enable: "Inschakelen",
      disableTwoFactorDesc:
        "Bevestig je wachtwoord om twee-factor authenticatie uit te schakelen.",
      enableTwoFactorDesc: "Bevestig je wachtwoord om verder te gaan.",
      enterPassword: "Vul je wachtwoord in",
      invalidPasswordError: "Ongeldig wachtwoord",
      scanQrDesc:
        "Scan met je authenticator app (bijv. Google Authenticator, 1Password).",
      enterSixDigitCode: "Voer de 6-cijferige code in:",
      backupCodesTitle: "Backup codes",
      backupCodesDesc:
        "Bewaar deze codes veilig. Je kunt ze gebruiken als je geen toegang hebt tot je authenticator app.",
      finished: "Gereed",
      copy: "Kopieer",
      copied: "Gekopieerd",
      deletePasskeyQuestion: "Passkey verwijderen",
      deletePasskeyDesc:
        "Weet je zeker dat je deze passkey wilt verwijderen? Je kunt dan niet meer inloggen met deze passkey.",
      addedOn: "Toegevoegd op",
      yearly: "Jaarlijks",
      expired: "Verlopen",
      visibleOnWebsite: "Zichtbaar op website",
      customHours: "Aangepast",
      multipleDays: "Meerdere dagen",
      endDate: "Einddatum",
      startDate: "Begindatum",
      fullyClosed: "Volledig gesloten",
      reasonOptional: "Reden (optioneel)",
      yearlyRepeat: "Jaarlijks herhalen",
      showOnWebsiteLabel: "Toon op website",
      active: "Actief",
      inactive: "Inactief",
      twoFaEnabled: "Ingeschakeld",
      twoFaDisabled: "Uitgeschakeld",
      remarks: "Opmerkingen",
      solutionCouldNotSave: "Kon realisatie niet opslaan",
      solutionCouldNotDuplicate: "Kon realisatie niet dupliceren",
      userCouldNotUpdate: "Kon gebruiker niet bijwerken",
      userCouldNotDelete: "Kon gebruiker niet verwijderen",
      siteCouldNotSave: "Kon site niet opslaan",
      siteCouldNotDelete: "Kon site niet verwijderen",
      appointmentCouldNotUpdate: "Kon afspraak niet bijwerken",
      appointmentCouldNotCancel: "Kon afspraak niet annuleren",
      appointmentCouldNotDelete: "Kon afspraak niet verwijderen",
      cancelAppointment: "Afspraak annuleren",
      deleteAppointment: "Afspraak verwijderen",
      overrideCouldNotAdd: "Kon uitzondering niet toevoegen",
      overrideCouldNotDelete: "Kon uitzondering niet verwijderen",
      siteUpdated: "Site bijgewerkt",
      siteCreated: "Site aangemaakt",
      contactInfo: "Contactgegevens",
      socialMedia: "Sociale media",
      companyInfo: "Bedrijfsgegevens",
      authenticatorApp: "Authenticator app",
      scanQrTitle: "Scan de QR code",
      continue: "Doorgaan",
      confirm: "Bevestigen",
      couldNotEnable2fa: "Kon 2FA niet inschakelen",
      couldNotDisable2fa: "Kon 2FA niet uitschakelen",
      addOverride: "Uitzondering toevoegen",
      addOverrideDesc:
        "Sluit de zaak op een specifieke datum of wijzig de openingsuren.",
      repeatYearly: "Jaarlijks herhalen",
      repeatWeekly: "Wekelijks herhalen",
      weekly: "Wekelijks",
      oneTime: "Eenmalig",
      exceptionType: "Type",
      dayOfWeek: "Dag",
      hours: "Uren",
      showOnWebsite: "Toon op website",
      from: "Van",
      to: "Tot",
      noNavigationLinksYet: "Nog geen navigatie links",
      noNavigationLinksDesc:
        "Maak je eerste link aan om de navigatie te configureren.",
      createLink: "Link aanmaken",
      subitems: "Subitems",
      noSubitemsYet: "Nog geen subitems",
      deleteLinkDesc: "Deze link en alle subitems worden permanent verwijderd.",
      seoPreview: "Google preview",
      seoTitleHint: "Laat leeg om de paginatitel te gebruiken",
      generateWithAI: "Genereer met AI",
      // User role strings
      assignSitesFirst: "Wijs eerst sites toe om beschikbare features te zien.",
      contentFeaturesLabel: "Content features",
      contentFeaturesDesc: "Beheer van website inhoud",
      businessFeaturesLabel: "Business features",
      businessFeaturesDesc: "Beheer van bedrijfsapplicaties",
      featuresAvailableForContent: "Functies beschikbaar voor contentbeheer",
      featuresForBusiness: "Functies voor bedrijfsapplicaties",
      modified: "aangepast",
      assignedSites: "Toegewezen sites",
      assignedSitesDesc: "Content features zijn beperkt tot de toegewezen sites",
      originalImage: "Origineel",
      startWithImage: "Upload eerst een afbeelding om te beginnen",
      modelFast: "Snel",
      modelStandard: "Standaard",
      modelBest: "Beste kwaliteit",
      // Image generation size options
      sizeSquare: "Vierkant",
      sizePortrait: "Portret",
      sizeLandscape: "Landschap",
      // Image generation quality options
      qualityAuto: "Auto",
      qualityHigh: "Hoog",
      qualityMedium: "Gemiddeld",
      qualityLow: "Laag",
      options: "Opties",
      questionTypes: {
        singleSelect: "Enkele keuze",
        multiSelect: "Meerdere keuzes",
        text: "Invulveld",
        number: "Getal",
        dimensions: "Afmetingen",
      },
      deleteStepQuestion: "Stap verwijderen?",
      deleteStepDesc: "Vragen in deze stap worden niet verwijderd, maar losgekoppeld.",
      editStepDesc: "Bewerk de stap naam en beschrijving.",
      newStepDesc: "Maak een nieuwe stap aan om vragen te groeperen.",
      questionsWithoutStep: "Vragen zonder stap",
      step: "Stap",
      noStep: "Geen stap",
      deleteQuestionQuestion: "Vraag verwijderen?",
      deleteQuestionDesc: "Weet je zeker dat je deze vraag wilt verwijderen?",
      editQuestionDesc: "Bewerk de vraag en opties.",
      newQuestionDesc: "Maak een nieuwe vraag aan voor de configurator.",
      submissionDetails: "Aanvraag details",
      yes: "Ja",
      no: "Nee",
      deleteItemQuestion: "Item verwijderen?",
      deleteItemDesc: "Weet je zeker dat je dit item wilt verwijderen?",
      editItemDesc: "Bewerk het item.",
      addItemDesc: "Maak een nieuw item aan.",
      configuratorCategory: "Configurator",
      configuratorCategoryDesc: "Koppel deze realisatie aan een configurator item",
      configuratorCategoryNone: "Geen",
      deleteCatalogueItemQuestion: "Catalogusitem verwijderen?",
      deleteCatalogueItemDesc: "Weet je zeker dat je dit catalogusitem wilt verwijderen? Opties die dit item gebruiken worden niet automatisch bijgewerkt.",
      editCatalogueItemDesc: "Bewerk het catalogusitem.",
      newCatalogueItemDesc: "Maak een nieuw item aan voor de prijscatalogus.",
      indicativePrice: "Indicatieve prijs",
      indicativePriceDisclaimer: "Exacte prijs na inmeting ter plaatse",
      // Visibility rules
      addRule: "Regel toevoegen",
      addCondition: "Voorwaarde toevoegen",
      makeConditional: "Vraag conditioneel maken",
      showQuestionWhen: "Toon deze vraag als",
      logicAll: "alle voorwaarden",
      logicAny: "één voorwaarde",
      logicSuffix: "waar is:",
      ruleWhen: "Als",
      ruleThen: "toon",
      ruleSelectQuestion: "Selecteer vraag...",
      ruleSelectOperator: "Selecteer...",
      ruleSelectValue: "Selecteer waarde...",
      ruleSelectTarget: "Selecteer vraag...",
      ruleSaved: "Regel opgeslagen",
      ruleDeleted: "Regel verwijderd",
      ruleSaveFailed: "Kon regel niet opslaan",
      conditional: "Conditioneel",
      operatorEquals: "is gelijk aan",
      operatorNotEquals: "is niet gelijk aan",
      operatorIncludes: "bevat",
      operatorNotIncludes: "bevat niet",
      operatorIsEmpty: "is leeg",
      operatorIsNotEmpty: "is ingevuld",
      operatorGreaterThan: "is groter dan",
      operatorLessThan: "is kleiner dan",
      actionShow: "toon",
      actionHide: "verberg",
      selectTarget: "Selecteer...",
    },

    /**
     * Role display names
     */
    roles: {
      superAdmin: "Super Admin",
      admin: "Admin",
      contentEditor: "Content Editor",
      user: "Gebruiker",
    },

    /**
     * Role descriptions
     */
    roleDescriptions: {
      superAdmin: "Volledige toegang tot alles",
      admin: "Content + afspraken, e-mails, conversaties, instellingen",
      contentEditor: "Alleen content beheren",
      user: "Geen standaard toegang - features moeten expliciet worden toegekend",
    },

    /**
     * Feature display names
     */
    features: {
      pages: "Pagina's",
      solutions: "Realisaties",
      navigation: "Navigatie",
      filters: "Filters",
      media: "Media",
      parameters: "Parameters",
      configurator: "Configurator",
      appointments: "Afspraken",
      emails: "E-mails",
      conversations: "Conversaties",
      settings: "Instellingen",
      users: "Gebruikers",
      sites: "Sites",
    },

    /**
     * Feature descriptions
     */
    featureDescriptions: {
      pages: "Beheer website pagina's",
      solutions: "Beheer realisaties/projecten",
      navigation: "Beheer menu structuur",
      filters: "Beheer filter categorieën",
      media: "Beheer afbeeldingen en bestanden",
      parameters: "Beheer site parameters",
      appointments: "Bekijk en beheer afspraken",
      emails: "Verstuur nieuwsbrieven",
      conversations: "Bekijk chatbot gesprekken",
      settings: "Beheer site instellingen",
    },
  },
} as const;

// Type utilities for extracting nested keys
type NestedKeyOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

/**
 * Type-safe string keys for autocomplete support
 * @example "admin.buttons.save" | "admin.labels.title" | ...
 */
export type StringKey = NestedKeyOf<typeof ADMIN_STRINGS>;

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" ? current : undefined;
}

/**
 * Get a string by dot-notation key with optional parameter interpolation.
 *
 * @param key - Dot-notation key (e.g., 'admin.buttons.save')
 * @param params - Optional parameters for interpolation
 * @returns The string value with parameters replaced
 *
 * @example
 * // Simple usage
 * t('admin.buttons.save') // "Bewaren"
 *
 * @example
 * // With interpolation (for future parameterized strings)
 * t('admin.messages.confirmDeleteItem', { name: 'Document' })
 * // "Weet je zeker dat je Document wilt verwijderen?"
 */
export function t(key: StringKey, params?: Record<string, string>): string {
  const value = getNestedValue(ADMIN_STRINGS, key);

  if (value === undefined) {
    console.warn(`Missing translation key: ${key}`);
    return key;
  }

  if (!params) {
    return value;
  }

  // Replace {param} placeholders with actual values
  return value.replace(
    /\{(\w+)\}/g,
    (match, paramKey) => params[paramKey] ?? match,
  );
}

/**
 * Check if a string key exists
 * @param key - The key to check
 * @returns true if the key exists
 */
export function hasKey(key: string): key is StringKey {
  return getNestedValue(ADMIN_STRINGS, key) !== undefined;
}
