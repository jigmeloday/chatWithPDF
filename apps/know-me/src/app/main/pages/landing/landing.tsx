import { Route, Routes } from 'react-router-dom';
import { Suspense } from 'react';
import { RouteModel } from '../../shared/model/shared.model';
import { Home }  from '@know-me/landing';

export function Landing():JSX.Element {

  return (
    <Home />
  );
}

export default Landing;
