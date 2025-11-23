# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

Inkle Frontend Intern Assignment

This project is a frontend assignment built using React and Vite.
It implements the provided Figma design and fulfills all required user flows, including table rendering, row editing, and API integration.

Live Demo

https://inkle-assignment-seven.vercel.app/

Features

Table built using @tanstack/react-table

Edit modal to update name and country

Country dropdown populated from the API

PUT request to update customer data

Country filter (multi-select)

Responsive layout

Clean Ocean-Blue UI with glass-style components

APIs Used

Taxes API
https://685013d7e7c42cfd17974a33.mockapi.io/taxes

Countries API
https://685013d7e7c42cfd17974a33.mockapi.io/countries

Tech Stack

React (Vite)

@tanstack/react-table

Axios

Custom CSS

Vercel for deployment
