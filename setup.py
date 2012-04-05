from setuptools import setup, find_packages

setup(name = 'websys_extjsclasses',
      description = 'Reusable extjs classes bundled as a Django app.',
      version = '1.0',
      license = 'BSD',
      url = 'http://espenak.net',
      author = 'Espen Angell Kristiansen',
      packages=find_packages(exclude=['ez_setup']),
      install_requires = ['setuptools', 'Django']
)
