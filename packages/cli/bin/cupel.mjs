#!/usr/bin/env node
// cupel-doctor — standalone entrypoint. Direct vers le scanner local.
import { runDoctor } from '../dist/index.js';
runDoctor(process.argv);
