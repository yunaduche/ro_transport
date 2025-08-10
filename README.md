# Problème de Transport - Recherche Opérationnelle

## Vue d'ensemble du projet

Ce projet est une application web complète dédiée à la résolution du **Problème de Transport** en Recherche Opérationnelle. Il implémente plusieurs algorithmes classiques pour trouver une solution optimale au problème de transport de marchandises entre sources et destinations.

## 🎯 Objectif du projet

Le problème de transport consiste à déterminer la quantité optimale de marchandises à transporter de plusieurs sources vers plusieurs destinations, en minimisant le coût total tout en respectant les contraintes d'offre et de demande.

## 🏗️ Architecture du projet

### Structure des fichiers
```
ro_projet/
├── index.html                 # Interface utilisateur principale
├── assets/
│   ├── css/                   # Styles et thèmes
│   ├── js/                    # Bibliothèques JavaScript
│   ├── script/                # Logique métier principale
│   │   ├── fill.js           # Gestion des tableaux et interface
│   │   ├── index.js          # Point d'entrée principal
│   │   └── inc/              # Algorithmes de résolution
│   │       ├── minili.inc.js # Méthode du coût minimum
│   │       ├── cno.inc.js    # Méthode Coin Nord-Ouest
│ │       ├── bhammer.inc.js  # Méthode Balas-Hammer
│ │       ├── minico.inc.js   # Méthode du coût minimum améliorée
│ │       ├── minitab.inc.js  # Méthode Minitab
│ │       ├── stone.inc.js    # Algorithme Stepping Stone
│ │       ├── tree.inc.js     # Visualisation des graphes
│ │       └── get.inc.js      # Utilitaires de récupération de données
│   └── vendor/                # Bibliothèques tierces
```

## 🚀 Fonctionnalités principales

### 1. Interface utilisateur intuitive
- **Configuration dynamique** : Définition du nombre de sources et destinations
- **Génération automatique** de matrices avec valeurs aléatoires équilibrées
- **Validation des données** : Vérification de l'équilibre offre/demande

### 2. Algorithmes de résolution implémentés
- **MINILI** : Méthode du coût minimum (coût le plus faible)
- **CNO** : Méthode Coin Nord-Ouest (règle simple et rapide)
- **Balas-Hammer** : Méthode de différence maximale
- **MINICO** : Méthode du coût minimum améliorée
- **MINITAB** : Méthode Minitab

### 3. Optimisation par Stepping Stone
- **Calcul des potentiels** pour chaque variable non-basique
- **Détermination des gains** de chaque itération
- **Convergence vers l'optimum** global

### 4. Visualisation des résultats
- **Tableaux d'itérations** : Suivi de l'évolution des solutions
- **Graphes de transport** : Représentation visuelle des flux
- **Calculs détaillés** : Affichage des potentiels et gains

## 🔧 Technologies utilisées

### Frontend
- **HTML5** : Structure sémantique
- **CSS3** : Styles modernes et responsive
- **JavaScript ES6+** : Logique métier et interactions
- **jQuery** : Manipulation du DOM et événements

### Bibliothèques tierces
- **GoJS** : Visualisation de graphes et diagrammes
- **SweetAlert** : Notifications et confirmations utilisateur
- **Bootstrap** : Composants UI et grille responsive

## 📊 Algorithme principal

### Phase 1 : Solution de base
1. **Sélection de la méthode** par l'utilisateur
2. **Génération de la solution initiale** selon l'algorithme choisi
3. **Vérification de la dégénérescence** et ajout d'epsilon si nécessaire

### Phase 2 : Optimisation
1. **Calcul des potentiels** pour chaque variable non-basique
2. **Détermination du gain maximum** négatif
3. **Application de la méthode Stepping Stone** :
   - Marquage du chemin de transfert
   - Calcul du coefficient de transfert
   - Mise à jour de la solution
4. **Répétition** jusqu'à convergence

### Phase 3 : Visualisation
1. **Affichage des itérations** dans des onglets
2. **Génération des graphes** de transport
3. **Calcul du coût total** (fonction objectif Z)

## 🎨 Interface utilisateur

### Design moderne et responsive
- **Thème clair** avec couleurs professionnelles
- **Layout responsive** adaptatif aux différentes tailles d'écran
- **Composants interactifs** avec animations et transitions
- **Navigation par onglets** pour les résultats d'itérations

### Composants principaux
- **Configuration de la matrice** : Définition des dimensions
- **Tableau des coûts** : Saisie des coûts unitaires
- **Gestion des stocks** : Offres et demandes
- **Résultats détaillés** : Solutions par itération
- **Visualisation graphique** : Graphes de transport

## 📈 Cas d'usage

### Éducation et formation
- **Cours de Recherche Opérationnelle**
- **Travaux pratiques** pour étudiants
- **Démonstration d'algorithmes** classiques

### Professionnel
- **Planification logistique** simple
- **Optimisation de transport** de marchandises
- **Analyse de coûts** de distribution

## 🔍 Points forts du projet

1. **Implémentation complète** de 5 méthodes de résolution
2. **Interface intuitive** pour la saisie des données
3. **Visualisation graphique** des solutions
4. **Suivi détaillé** des itérations d'optimisation
5. **Gestion des cas dégénérés** avec epsilon
6. **Code modulaire** et bien structuré
7. **Documentation intégrée** dans le code

## 🚧 Améliorations possibles

### Fonctionnalités
- **Export des résultats** (PDF, Excel)
- **Sauvegarde/chargement** de problèmes
- **Comparaison** de plusieurs méthodes
- **Analyse de sensibilité** des paramètres

### Technique
- **Tests unitaires** automatisés
- **Optimisation des performances** pour grandes matrices
- **Interface mobile** native
- **API REST** pour intégration

## 📚 Références théoriques

- **Hillier & Lieberman** : Introduction to Operations Research
- **Taha** : Operations Research: An Introduction
- **Winston** : Operations Research: Applications and Algorithms

## 👥 Public cible

- **Étudiants** en Recherche Opérationnelle
- **Enseignants** et formateurs
- **Professionnels** de la logistique
- **Chercheurs** en optimisation

## 📝 Licence

Ce projet est développé à des fins éducatives et de démonstration des algorithmes de Recherche Opérationnelle.

---

*Projet développé pour l'étude et l'enseignement des méthodes de résolution du problème de transport en Recherche Opérationnelle.* 