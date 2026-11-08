# -*- coding: utf-8 -*-
"""Normaliza texto pt-BR para comparar o roteiro com a transcricao do Whisper.

O Whisper escreve numeros com digitos ("290", "1º") e siglas juntas ("OS"); o roteiro usa
palavras e siglas soletradas ("O S"). key() leva os dois lados a mesma forma, sem espacos, para
que so diferencas reais (palavra trocada, palavra lida em ingles, trecho cortado) contem.
"""
import re

from num2words import num2words


def _ordinal(m):
    return ' %s ' % num2words(int(m.group(1)), lang='pt_BR', to='ordinal')


def _cardinal(m):
    return ' %s ' % num2words(int(m.group(0)), lang='pt_BR')


def norm(text):
    s = text.lower()
    s = re.sub(r'(\d+)\s*[ºª°]', _ordinal, s)
    s = re.sub(r'\d+', _cardinal, s)
    s = s.replace('-', ' ')
    s = re.sub(r'[^\w\s]', ' ', s)
    return ' '.join(s.split())


def key(text):
    """Forma comparavel sem espacos: "O S" == "OS", "e-mail" == "email"."""
    return norm(text).replace(' ', '')
